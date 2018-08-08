function comment(obj){
    var blog_id = $(obj).attr('data-id');
    var c_area = $(obj).parent().parent().siblings().find('.social-comment');  //评论区

    layui.use(['layer', 'layedit'], function(){
        var layer = layui.layer;
        var layedit = layui.layedit;

        var box;
        layer.ready(function(){
            box = layer.open({
                type: 1,
                title: '评论',
                shade: [0.2, '#393D49'],
                anim : 4,
                skin: 'layui-layer-molv', //加上边框
                maxmin: false, //开启最大化最小化按钮
                area: ['700px', '280px'],
                content: $("#comment_box")
            });
        });

        //构建一个默认的编辑器
        var index = layedit.build('LAY_demo2', {
            tool: ['face', 'link', 'unlink', '|', 'left', 'center', 'right']
            ,height: 100
        });

        $('#c_btn').on('click', function(){
            var content = layedit.getContent(index); //获取编辑器内容
            layer.ready(function(){
                if('' == content){
                    layer.msg('发表的评论不能为空', {time:1000});
                    return ;
                }

                $.post(post_comment_url, {'content' : content, 'blog_id' : blog_id}, function(res){
                    if(1 == res.code){
                        layer.msg(res.msg, {'time' : 1500});
                        setTimeout(function(){
                            layer.close(box);
                            window.location.reload();
                        }, 1500);
                    }else{
                        layer.msg(res.msg, {'time' : 1500});
                    }
                }, 'json');
            });
        });
    });
}

$(function(){
    //隐藏没有评论的div
    $(".social-feed-box .social-footer").each(function(index){
        if(61 == $(this).find('.social-comment').html().length){
            $(this).hide();
        }
    });
    //发表说说
    $(".consult").click(function(){
        layui.use(['layer', 'layedit'], function(){
            var layer = layui.layer;
            var layedit = layui.layedit;

            var box;
            layer.ready(function(){
                box = layer.open({
                    type: 1,
                    title: '发表说说',
                    shade: [0.2, '#393D49'],
                    anim : 1,
                    skin: 'layui-layer-molv', //加上边框
                    maxmin: false, //开启最大化最小化按钮
                    area: ['700px', '460px'],
                    content: $("#blog_box")
                });
            });

            layedit.set({
                uploadImage: {
                    url: img_url //接口url
                }
            });

            //构建一个默认的编辑器
            var index = layedit.build('LAY_demo1');

            $('.site-demo-layedit').on('click', function(){
                var content = layedit.getContent(index); //获取编辑器内容
                layer.ready(function(){
                    if('' == content){
                        layer.msg('发表的说说不能为空', {time:1000});
                        return ;
                    }

                    $.post(post_tips_url, {'content' : content}, function(res){
                        if(1 == res.code){
                            layer.msg(res.msg, {'time' : 1500});
                            setTimeout(function(){
                                layer.close(box);
                                window.location.reload();
                            }, 1500);
                        }else{
                            layer.msg(res.msg, {'time' : 1500});
                        }
                    }, 'json');
                });
            });
        });
    });
});
