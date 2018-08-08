document.onkeydown=function(event){
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if(e && e.keyCode==13){ // enter 键
        login();
    }
};

function login(){
    var username = document.getElementById("ID").value;
    var password = document.getElementById("PASSWORD").value;
    var code = document.getElementById("code").value;
    if(username==""){
        $.jGrowl("用户名不能为空！", { header: '提醒' });
    }else if(password==""){
        $.jGrowl("密码不能为空！", { header: '提醒' });
    }else if(code==""){
        $.jGrowl("验证码不能为空！", { header: '提醒' });
    }else{
        AjaxFunc();
    }
}
function AjaxFunc()
{
    var username = document.getElementById("ID").value;
    var password = document.getElementById("PASSWORD").value;
    var code = document.getElementById("code").value;
    layui.use(['layer'],function(){
        var layer = layui.layer;
        layer.ready(function(){
            layer.load(0, {shade:false, time:100});
        });
    });
    $.ajax({
        type: 'post',
        url: url,
        dataType: "json",
        data: {"user": username,"password": password,'code':code},
        success: function (res) {
            if(1 == res.code){
                   $.jGrowl(res.msg);
                    window.location.href = res.data;
            }else{
                $('#code_img').attr('src','/captcha/admin_login.html');
            	$.jGrowl(res.msg);
            }
        },
        error: function (xhr, type) {
            console.log(xhr);
        }
    });
}