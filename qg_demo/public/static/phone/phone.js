layui.use('mobile', function(){
    var mobile = layui.mobile
        ,layim = mobile.layim
        ,layer = mobile.layer;

    layim.config({
        title: '汇彩'
        //上传图片接口
        ,uploadImage: {
            url: '/phone/upload/uploadImg' //（返回的数据格式见下文）
            ,type: '' //默认post
        }

        //上传文件接口
        ,uploadFile: {
            url: '/phone/upload/uploadFile' //（返回的数据格式见下文）
            ,type: '' //默认post
        }

        ,init: userlist

        //扩展更多列表
        ,moreList: [{
            alias: 'find'
            ,title: '好友通知'
            ,iconUnicode: '&#xe613;' //图标字体的unicode，可不填
            ,iconClass: '' //图标字体的class类名
        }]

        ,isNewFriend: true //是否开启“新的朋友”
        ,isgroup: true //是否开启“群聊”
        //,chatTitleColor: '#c00' //顶部Bar颜色
        //,title: 'LayIM' //应用名，默认：我的IM
    });

    socket = new WebSocket(socket_server);
    // 连接发生错误的回调方法
    socket.onerror = function () {
         layer.open({
            content: '您已与服务器断开连接，是否重新链接？'
            ,btn: ['重连', '不要']
            ,yes: function(index){
              location.reload();
              layer.close(index);
            }
          });
    };

    //连接成功时触发
    socket.onopen = function(){
        // 登录
        var login_data = '{"type":"init","id":"' + m_uid + '", "username":"' + m_uname + '", "avatar":"'
            + m_avatar + '", "sign":"' + m_sign + '"}';
        socket.send( login_data );
        layer.msg('连接成功');
    };

    //监听收到的消息
    socket.onmessage = function(res){
        //console.log(res.data);
        var data = eval("("+res.data+")");
        switch(data['message_type']){
            // 服务端ping客户端
            case 'ping':
                //console.log(data);
                socket.send('{"type":"ping"}');
                break;
            // 在线
            case 'online':
                layim.setFriendStatus(data.id, 'online');
                break;
            // 下线
            case 'offline':
                layim.setFriendStatus(data.id, 'offline');
                break;
            // 检测聊天数据
            case 'chatMessage':
                //console.log(data.data);
                layim.getMessage(data.data);
                break;
            // 离线消息推送
            case 'logMessage':
                setTimeout(function(){layim.getMessage(data.data)}, 1000);
                break;
            // 用户退出 更新用户列表
            case 'logout':
                layim.setFriendStatus(data.id, 'offline');
                break;
        }
    };

    // 连接失败

    // 监听点击“新的朋友”
    layim.on('newFriend', function(){

        var _html = [
            '<div class="layui-container" style="margin-top: 10px">',
                '<div class="layui-row">',
                    '<div class="layui-col-xs9 layui-col-sm9 layui-col-md9">',
                        '<input type="text" placeholder="请输入用户名" class="layui-input" id="search">',
                    '</div>',
                    '<div class="layui-col-xs2 layui-col-sm2 layui-col-md2">',
                        '<button class="layui-btn" id="do-search">搜索</button>',
                    '</div>',
                '</div>',
            '</div>',
            '<hr/>',
            '<blockquote class="layui-elem-quote">搜索结果</blockquote>',
            '<ul class="layui-layim-list layui-show" id="friends">',
            '</ul>'
        ].join('');

        layim.panel({
            title: '新的朋友' //标题
            ,tpl: _html
        });

        // 搜索好友
        layui.use(['jquery', 'mobile'], function(){
            var $ = layui.jquery,
                mobile = layui.mobile,
                layer = mobile.layer;
            $("#do-search").click(function(){
                var search = $("#search").val();
                if('' == search){
                    layer.msg('用户名不能为空');
                    return false;
                }

                $.post("/phone/finduser/index", {user_name: search}, function(res){
                    var _html = '';
                    if(1 == res.code){
                        $.each(res.data, function(k, v){

                            _html = '<li style="background: white;margin-top: 5px">',
                                _html += '<div><img src="' + v.avatar + '"></div>';
                            _html += '<span>' + v.user_name + '</span>';
                            _html += '<button class="layui-btn layui-btn-danger" style="float:right" data-uid="' +
                                v.id + '" onclick="addFriend(this)">添加</button></li>';
                        });
                    }
                    $('#friends').html(_html);
                }, 'json');
            });
        });
    });

    // 监听点击更多列表
    layim.on('moreList', function(obj){
        switch(obj.alias){
            // 好友验证消息
            case 'find':
                var _html = [
                    '<ul class="layui-layim-list layui-show" id="message">',
                    '</ul>'
                ].join('');

                layim.panel({
                    title: '好友通知' //标题
                    ,tpl: _html
                });

                showMessage();
                // 设置发现标记 为已读
                layim.showNew('More', false);
                layim.showNew('find', false);
                break;
        }
    });

    //监听发送消息
    layim.on('sendMessage', function(data){
        var mine = JSON.stringify(data.mine);
        var to = JSON.stringify(data.to);
        var login_data = '{"type":"chatMessage","data":{"mine":' + mine + ', "to":' + to + '}}';
        socket.send( login_data );
    });

    //监听查看更多记录
    layim.on('chatlog', function(data, ul){
        console.log(data);
        layim.panel({
            title: '与 '+ data.username +' 的聊天记录' //标题
            ,tpl: '<div style="padding: 10px;">这里是模版，{{d.data.test}}</div>' //模版
            ,data: { //数据
                test: 'Hello'
            }
        });
    });
});

// 加好友
function addFriend(obj){
    layui.use(['jquery', 'layer'], function(){
        var $ = layui.jquery;
		var layer = layui.layer;

        var uid = $(obj).attr('data-uid');
        //通知对方
        $.post('/phone/msgbox/applyFriend', {
            uid: uid
        }, function(res){
            if(res.code != 0){
                return layer.msg(res.msg);
            }
            layer.msg('好友申请已发送，请等待对方确认', {
                icon: 1
                ,shade: 0.5
            }, function(){
                layer.close(index);
            });
        });
    });
}

// 获取未读的消息 120s读取一次
setInterval(function(){
    layui.use(['mobile', 'jquery'], function(){
        var mobile = layui.mobile
            ,layim = mobile.layim
            ,$ = layui.jquery;
        $.getJSON('/phone/msgbox/getNoRead', function(res){
            if(res.data > 0){
                layim.showNew('More', true);
                layim.showNew('find', true);
            }
        });
    })
}, parseInt(10) * 1000);

// 展示好友添加信息
function showMessage() {
    layui.use(['mobile', 'jquery'], function(){
        var mobile = layui.mobile,
            layim = mobile.layim,
            layer = mobile.layer,
            $ = layui.jquery;

        $.getJSON('/phone/msgbox/getMsg', function(res){
            var _html = '';
            if(1 == res.code) {
                $.each(res.data, function (k, v) {

                    if (1 == v.type) {
                        if (0 == v.agree) {

                            _html += '<li style="background: white;margin-top: 5px"><div>',
                                _html += '<img src="' + v.user.avatar + '"></div><span>' + v.user.username + '</span>';
                            _html += '<button class="layui-btn" style="float:right;margin-left: 5px" data-id="' +
                                v.id + '" data-uid="' + v.user.id + '" data-sign="' + v.user.sign +
                                '" data-avatar="' + v.user.avatar + '" data-username="' + v.user.username + '" onclick="pass(this, 1)">同意</button>';
                            _html += '<button class="layui-btn layui-btn-danger" style="float:right" data-id="' +
                                v.id + '" data-uid="' + v.user.id + '" data-sign="' + v.user.sign +
                                '" data-avatar="' + v.user.avatar + '" data-username="' + v.user.username + '" onclick="pass(this, 2)">拒绝</button></li>';

                        } else if (1 == v.agree) {
                            _html += '<li style="background: white;margin-top: 5px"><div>',
                                _html += '<img src="' + v.user.avatar + '"></div><span>' + v.user.username + '</span>';
                            _html += '<span style="float:right;color:green">已同意</span>';
                        } else {
                            _html += '<li style="background: white;margin-top: 5px"><div>',
                                _html += '<img src="' + v.user.avatar + '"></div><span>' + v.user.username + '</span>';
                            _html += '<span style="float:right;color:red">已拒绝</span>';
                        }
                    } else {
                        _html += '<li style="background: white;margin-top: 5px">' + v.content + '</li>';
                    }

                });
            }
            $("#message").html(_html);
        });
    });
}

// 审批用户申请
function pass(obj, flag){
    layui.use(['mobile', 'jquery'], function(){
        var mobile = layui.mobile,
            layim = mobile.layim,
            layer = mobile.layer,
            $ = layui.jquery;

        var id = $(obj).data('id');
        var uid = $(obj).data('uid');
        var sign = $(obj).data('sign');
        var avatar = $(obj).data('avatar');
        var username = $(obj).data('username');
        // 同意
        if(1 == flag){
            $.post('/phone/msgbox/agreeFriend', {
                uid: uid // 对方用户ID
                , from_group: 1 // 对方设定的好友分组
                , group: 1 // 我设定的好友分组
                , id : id
            }, function(res){
                if(res.code != 0){
                    return layer.msg(res.msg);
                }

                // 将好友追加到主面板
                layim.addList({
                    type: 'friend'
                    , avatar: avatar // 好友头像
                    , username: username // 好友昵称
                    , groupid: 1 // 所在的分组id
                    , id: uid // 好友ID
                    , sign: sign // 好友签名
                });

                // 通知对方将我加入好友列表
                var data = '{"type":"addFriend", "toid":"' + uid + '", "id":"' + m_uid + '", "username":"' +
                    m_uname + '", "avatar":"' + m_avatar + '", "sign":"' + m_sign + '", "groupid": 1}';
                socket.send(data);

                showMessage();
            });
        }else{

            // 不同意
            //询问框
            layer.open({
                content: '确定拒绝吗？'
                ,btn: ['确定', '不要']
                ,yes: function(index){
                    var id = $(obj).data('id');
                    var uid = $(obj).data('uid');

                    $.post('/phone/msgbox/refuseFriend', {
                        uid : uid, //对方用户ID
                        id : id
                    }, function(res){
                        if(res.code != 0){
                            return layer.msg(res.msg);
                        }
                        layer.close(index);
                        showMessage();
                    });
                }
            });
        }

    })
}

