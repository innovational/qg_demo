layui.use(['form', 'layer'], function () {
    var form = layui.form();
    var layer = layui.layer;
    form.verify({
        username: function (value) {
            if (Nick.GetLength(value) < 4 || Nick.GetLength(value) > 18) {
                return '用户名必须在4-18个字符之间';
            }

            if (!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]+$").test(value)) {
                return '用户名不能有特殊字符';
            }
            if (/(^\_)|(\__)|(\_+$)/.test(value)) {
                return '用户名首尾不能出现下划线\'_\'';
            }
            if (/^\d+\d+\d$/.test(value)) {
                return '用户名不能全为数字';
            }
        }
        , pass: [
            /^[\S]{6,12}$/
            , '密码必须6到12位，且不能出现空格'
        ]
    });
    //监听提交表单
    form.on('submit(*)', function (data) {
        layer.ready(function () {
            var post_data = data.field;
            if (post_data['pwd'] != post_data['repwd']) {
                layer.tips('两次输入密码不一致', '#pwd');
                return;
            }
            var index = layer.load(1, {
                shade: [0.1, '#fff'] //0.1透明度的白色背景
            });
            $.post(do_register_url, post_data, function(res){
                layer.close(index);
                if(1 == res.code){
                    layer.ready(function(){
                        layer.msg(res.msg, {time:2000});
                        window.location.href = res.data;
                    });
                }else{
                    layer.ready(function(){
                        layer.msg(res.msg, {time:2000});
                    });
                }
            }, 'json');
        });
        return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
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

        layui.cityselect.Init('register_form', p_code, c_code, a_code);
    });
});
