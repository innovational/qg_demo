<?php
/**
 * Created by PhpStorm.
 * User: wenwu
 * Date: 2018/8/7
 * Time: 16:13
 */
namespace app\admin\model;
use think\Db;

class Member extends Models {
    protected $table='qg_member';
    //验证登录密码
    public function check_login($user,$password){
        $userInfo=Db::name($this->table)->field('id,password,status')->where('admin_user',$user)->find();
        if(empty($userInfo))return arr_return(0,'该用户不存在');
        if($userInfo['status']!=1)return arr_return(0,'该用户已禁用');
        if($userInfo['password']!=md5($password))return arr_return(0,'密码不一致');
        $userInfo['admin_user']=$user;
        session('memberInfo',$userInfo);
        return arr_return(1,'登录成功','/admin');
    }
    //新增账号
    public function add($user,$password){
        $userInfo=Db::name($this->table)->field('id')->where('admin_user',$user)->find();
        if(!empty($userInfo))return arr_return(0,'该用户已存在');
        $data=[
            'admin_user'=>$user,
            'password'=>md5($password),
            'create_time'=>$_SERVER['REQUEST_TIME']
        ];
        $id=Db::name($this->table)->insertGetId($data);
        if($id){
            if($this->cache)$this->get($id);
            return arr_return(1,'添加成功');
        }else{
            return arr_return(0,'添加失败');
        }
    }
}