<?php
/**
 * Created by PhpStorm.
 * User: wenwu
 * Date: 2018/8/7
 * Time: 13:19
 */
namespace app\admin\controller;
use think\Controller;
use think\Request;

class Common extends Controller{
    protected $memberInfo=null;
    public function __construct(Request $request = null){
        parent::__construct($request);
        $info=session('memberInfo');
        if(empty($info) || empty($info['id'])){
            header('location:/admin/login');
        }
        $this->memberInfo=$info;
    }
}