<?php
/**
 * Created by PhpStorm.
 * User: wenwu
 * Date: 2018/8/7
 * Time: 13:19
 */
namespace app\admin\controller;

use app\admin\model\Member;
use think\Controller;

class Login extends Controller{
    public function index(){
        return $this->fetch();
    }
    //验证登录
    public function check_login(){
        check();
        $code=check(input('code'),'验证码不能为空');
        if(!captcha_check($code,'admin_login')){
            return arr_return(0,'验证码不正确');
        }
        $user=check(input('user'),'用户名不能为空');
        $password=check(input('password'),'密码不能为空');
        check(strlen($user)>=5,'用户名不低于5位');
        check(strlen($password)>=5,'用户名不低于5位');
        $memberObj=new Member();
        return $memberObj->check_login($user,$password);
    }

    public function login_out(){
        session('memberInfo',null);
        $this->redirect(url('login/index'));
    }
    public function add_user(){
        echo '请自行修改本方法代码';exit;
        $memberObj=new Member();
        $res=$memberObj->add('admin','admin');
        echo $res['msg'];
    }
}