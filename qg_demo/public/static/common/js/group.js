// 基础配置项
var baseConfig = {
    socket_server: '127.0.0.1:8282',
    add_group_url: "/index/findgroup/addgroup",
    up_img_url: "/index/Findgroup/upGroupAvatar",
};

// 合并对象
function extend(target, source) {
    for (var obj in source) {
        target[obj] = source[obj];
    }
    return target;
}

var baseConfig = extend(baseConfig, config || {});
var socket = new WebSocket('ws://' + baseConfig.socket_server);

layui.use(['upload', 'layer'], function(){
    var layer = layui.layer;

    layui.upload({
        url: baseConfig.up_img_url
        ,elem: '#avatar' //指定原始元素，默认直接查找class="layui-upload-file"
        ,ext: 'jpg|png'
        ,success: function(res){
            if(1 == res.code){
                $("#upimg").html('<img src="' + res.url + '" width="38px" height="38px"/>');
                $("#group_avatar").val(res.url);
            }else{
                layer.msg(res.msg, {time:2000});
            }
        }
    });
});

$(function(){
    layui.use(['layer'], function(){
        var layer = layui.layer;
        layer.ready(function(){
            $("#sub").click(function(){
                var group_name = $("#group_name").val();
                if('' == group_name){
                    layer.msg('群名不能为空', {time:2000});
                    return;
                }

                if (Nick.GetLength(group_name) < 4 || Nick.GetLength(group_name) > 25) {
                    layer.msg('群名必须在4-25个字符之间', {time:2000});
                    return;
                }

                if (!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]+$").test(group_name)) {
                    layer.msg('群名不能有特殊字符', {time:2000});
                    return;
                }

                if (/(^\_)|(\__)|(\_+$)/.test(group_name)) {
                    layer.msg('群名首尾不能出现下划线\'_\'', {time:2000});
                    return;
                }

                if (/^\d+\d+\d$/.test(group_name)) {
                    layer.msg('群名不能全为数字', {time:2000});
                    return;
                }

                var avatar = $("#group_avatar").val();
                if('' == avatar){
                    layer.msg('请上传群头像', {time:2000});
                    return;
                }

                $.post(baseConfig.add_group_url, {'group_name' : group_name, 'avatar' : avatar}, function(res){
                    if(1 == res.code){
                        layer.msg(res.msg, {time:2000});
                        //推送给socket服务器，将管理员加入群组
                        var group_data = '{"type":"addGroup","join_id":"' + res.data.join_id + '", ' +
                            '"avatar":"' + avatar + '", "id":"' + res.data.group_id + '", "groupname":"' + group_name + '"}';
                        socket.send(group_data);

                        setTimeout(function(){
                            var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                            parent.layer.close(index); //再执行关闭
                        }, 1500);
                    }else{
                        layer.msg(res.msg, {time:2000});
                    }
                }, 'json');
            });
        });
    });
});

var Nick = {};
//计算字符长度，包括中英文
Nick.GetLength = function (str) {
    var realLength = 0, len = str.length, charCode = -1;
    for (var i = 0; i < len; i++) {
        charCode = str.charCodeAt(i);
        if (charCode > 0 && charCode <= 128) realLength += 1;
        else realLength += 2;
    }
    return realLength;
}
