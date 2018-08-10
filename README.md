前端直接扒的页面 
线上体验地址 http://bbs.wenwuit.cn/admin
用户名 admin  密码 admin

部署请开启伪静态
    nginx:
        if (!-e $request_filename) {rewrite  ^(.*)$  /index.php?s=/$1  last;break;}

店铺·分类·属性分组，均为代码配置！可扩展成数据库！

添加新用户地址  http://bbs.wenwuit.cn/admin/login/add_user

更新为响应式后台 列表也支持H5

后面会更新权限管理，节点管理