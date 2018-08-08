// 基础配置项
var baseConfig = {
    socket_server: '127.0.0.1:8282',
    group_node: '',
    detail_url: "/index/findgroup/mygroup",
    remove_member_url: "/index/findgroup/removeMember",
    remove_group_url: "/index/findgroup/removeGroup"
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

layui.use(['tree', 'layer', 'laytpl', 'laypage'], function() {
    var layer = layui.layer,
        $ = layui.jquery,
        laytpl = layui.laytpl,
        laypage = layui.laypage;

    layui.tree({
        elem: '#mygroup' //指定元素
        , click: function (item) { //点击节点回调
            if(0 != item.id){
                layer.ready(function(){
                    var loading = layer.load(0, {shade: false});
                    $("#g_name").text(item.name);
                    $("#group_id").val(item.id);
                    getMembers($, laytpl, laypage, item.id, 1, loading);
                });
            }
        }
        , nodes: [ //节点
            {
                name: '我的群组'
                , id: 0
                , spread : true
                , children: baseConfig.group_node
            }
        ]
    });

    $(".layui-tree-leaf").html('&#xe613;');
});

//异步获取数据
function getMembers($, laytpl, laypage, id, curr, loading){
    $("#now_page").val(curr);  //标注当前页面
    $.getJSON(baseConfig.detail_url, {
        page: curr || 1,
        id : id
    }, function(res){

        layer.close(loading);
        if(1 == res.code){
            $("#m_num").html('(' + res.data.total + '人)');
            var gettpl = document.getElementById('userList').innerHTML;
            laytpl(gettpl).render(res.data, function(html){
                document.getElementById('view').innerHTML = html;
            });
            //分页
            laypage({
                cont: 'page'
                ,pages: Math.ceil(res.data.total/res.data.per_page)
                ,first: false
                ,last: false
                ,curr: curr || 1 //当前页
                ,jump: function(obj, first){
                    if(!first){ //点击跳页触发函数自身，并传递当前页：obj.curr
                        getMembers($, laytpl, laypage, id, obj.curr, loading);
                    }
                }
            });
        }
    });
}

//移除群成员
function letOut(uid) {
    layui.use(['layer', 'laytpl', 'laypage'], function() {
        var layer = layui.layer,
            $ = layui.jquery,
            laytpl = layui.laytpl,
            laypage = layui.laypage;

        layer.ready(function(){
            //询问框
            layer.confirm('确定移除该成员？', {
                btn: ['确定','取消'],
                title: '友情提示',
                closeBtn: 0,
                icon: 3
            }, function(){
                var group_id = $('#group_id').val();
                if('' == group_id){
                    layer.msg('数据异常', {time:2000});
                    return ;
                }
                var page = $('#now_page').val() || 1;  //需要刷新的页面
                $.post(baseConfig.remove_member_url, {uid: uid, gid : group_id}, function(res){
                    if(1 == res.code){
                        layer.msg(res.msg, {time:1000});
                        // 通知被移除的用户，从其面板中将群组信息移除
                        var remove_data = '{"type":"removeMember", "remove_id": "' + uid + '", "group_id" : "' + group_id + '"}';
                        socket.send(remove_data);

                        setTimeout(function(){
                            getMembers($, laytpl, laypage, group_id, page);
                        }, 1000);
                    }else{
                        layer.msg(res.msg, {time:2000});
                    }
                }, 'json');
            }, function(){

            });
        });
    });
}

//解散群组
function break_up(){
    layui.use(['layer'], function(){
        var layer = layui.layer,
            $ = layui.jquery;

        var group_id = $("#group_id").val();
        if('' == group_id){
            layer.alert('请先点击选择要解散的群组', {icon:2, title:'友情提示', closeBtn:0});
            return ;
        }

        layer.ready(function(){
            //询问框
            var group_name = $("#g_name").text();
            layer.confirm(group_name, {
                btn: ['确定','取消'],
                title: '确定解散',
                closeBtn: 0,
                icon: 3
            }, function(){
                var group_id = $('#group_id').val();
                if('' == group_id){
                    layer.msg('数据异常', {time:2000});
                    return ;
                }
                $.post(baseConfig.remove_group_url, {gid : group_id}, function(res){
                    if(1 == res.code){
                        // 通知断开链接
                        var break_data = '{"type":"breakUp", "uids":"' + res.data + '", "group_id":"' + group_id + '"}';
                        socket.send(break_data);

                        layer.msg(res.msg, {time:1000});
                        $("#group_id").val('');
                        $("#g_name").text();
                        setTimeout(function(){
                            window.location.reload();
                        }, 1000);
                    }else{
                        layer.msg(res.msg, {time:2000});
                    }
                }, 'json');
            }, function(){

            });
        });
    });
}
