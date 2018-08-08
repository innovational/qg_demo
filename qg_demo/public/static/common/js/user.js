// 基础配置项
var baseConfig = {
    p_code: '', // 省份编码
    c_code: '', // 城市编码
    a_code: '', // 区域编码
    do_change_url: '/index/chatuser/doChange', // 修改用户
    up_avatar_url: '/index/chatuser/upavatar', // 修改头像
};

// 合并对象
function extend(target, source) {
    for (var obj in source) {
        target[obj] = source[obj];
    }
    return target;
}

var baseConfig = extend(baseConfig, config || {});

layui.use(['form', 'layer', 'upload'], function () {
    var form = layui.form();
    var layer = layui.layer;
    //修改头像
    layui.upload({
        url: baseConfig.up_avatar_url
        ,title: '修改头像'
        ,ext: 'jpg|png'
        ,success: function(res){
            if(1 == res.code){
                $("#LAY_demo_upload").attr('src', res.url);
                $("#user_avatar").val(res.url);
            }else{
                layer.msg(res.msg, {time:2000});
            }
        }
    });

    //提交修改项
    $("#btn").click(function(){

        layer.ready(function(){

            var user_name = $("#user_name").val();
            if('' == user_name){
                layer.tips('用户名不能为空', '#user_name');
                return ;
            }
            if (Nick.GetLength(user_name) < 4 || Nick.GetLength(user_name) > 18) {
                layer.tips('用户名必须在4-18个字符之间', '#user_name');
                return ;
            }
            if (!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]+$").test(user_name)) {
                layer.tips('用户名不能有特殊字符', '#user_name');
                return ;
            }
            if (/(^\_)|(\__)|(\_+$)/.test(user_name)) {
                layer.tips('用户名首尾不能出现下划线\'_\'', '#user_name');
                return ;
            }
            if (/^\d+\d+\d$/.test(user_name)) {
                layer.tips('用户名不能全为数字', '#user_name');
                return ;
            }

            var user_avatar = $("#user_avatar").val();

            var oldpwd = $("#oldpwd").val(); //旧密码
            var pwd = $("#pwd").val();
            var repwd = $("#repwd").val();

            if('' != oldpwd && !/^[\S]{6,12}$/.test(oldpwd)){
                layer.tips('密码必须6到12位，且不能出现空格', '#oldpwd');
                return ;
            }

            if('' == pwd && '' != repwd){
                layer.tips('新密码不能为空', '#pwd');
                return ;
            }

            if('' != pwd && '' == repwd){
                layer.tips('重复密码不能为空', '#repwd');
                return ;
            }

            if('' != pwd && '' != repwd && '' == oldpwd){
                layer.tips('必须输入旧密码', '#oldpwd');
                return ;
            }

            if('' != pwd && '' != repwd && '' != oldpwd && pwd != repwd){
                layer.tips('两次密码不一致', '#pwd');
                return ;
            }

            if('' != pwd && '' != repwd && '' != oldpwd && pwd == repwd){
                if(!/^[\S]{6,12}$/.test(pwd)){
                    layer.tips('密码必须6到12位，且不能出现空格', '#pwd');
                    return ;
                }
                if(!/^[\S]{6,12}$/.test(repwd)){
                    layer.tips('密码必须6到12位，且不能出现空格', '#repwd');
                    return ;
                }
            }

            var sex = $("input[name='sex']:checked").val();
            var age = $("#age").val();

            var pid = $("select[name='province'] option:selected").val();
            var cid = $("select[name='city'] option:selected").val();
            var aid = $("select[name='area'] option:selected").val();

            if('' == pid && '' == cid && '' == aid){
                layer.msg('居住地不能空');
                return ;
            }

            $.post(baseConfig.do_change_url,
                {
                    'user_name' : user_name,
                    'oldpwd' : oldpwd,
                    'pwd' : pwd,
                    'repwd' : repwd,
                    'avatar' : user_avatar,
                    'sex' : sex,
                    'age' : age,
                    'pid' : pid,
                    'cid' : cid,
                    'aid' : aid
                }, function(res){
                    layer.close(index);
                    if(1 == res.code){
                        layer.msg(res.msg, {time:1500});
                        setTimeout(function(){
                            var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                            parent.layer.close(index); //再执行关闭
                        }, 1500);
                    }else{
                        layer.msg(res.msg, {time:2000});
                    }
                }, 'json');

            var index = layer.load(1, {
                shade: [0.1, '#fff'] //0.1透明度的白色背景
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


//省市区三级联动
$(function () {

    layui.use(['cityselect'], function () {

        layui.cityselect.Init('user_info', baseConfig.p_code, baseConfig.c_code, baseConfig.a_code);
    });
});
