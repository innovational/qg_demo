<?php
/**
 * Created by PhpStorm.
 * User: wenwu
 * Date: 2018/8/7
 * Time: 13:18
 */
namespace app\admin\controller;
class Index extends Common {
    public function index(){
        return $this->fetch();
    }
}