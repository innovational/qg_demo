<?php
/**
 * Created by PhpStorm.
 * User: wenwu
 * Date: 2018/5/14
 * Time: 15:46
 */
namespace app\admin\controller;
class Upload {
    public function index(){
        check();
        $imgData = check(input('imgdata'));
        return base64_upload_img($imgData,'/data/images',input('url'));
    }
}