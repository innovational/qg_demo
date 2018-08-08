<?php
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2016 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: 流年 <liu21st@gmail.com>
// +----------------------------------------------------------------------

// 应用公共文件

//返回状态数组
function arr_return($code=0,$msg='',$data=[],$url=''){
    $arr['code']=$code;
    if(!empty($msg)){
        $arr['msg']=$msg;
    }
    if(!empty($data)){
        $arr['data']=$data;
    }
    if(!empty($url)){
        $arr['url']=$url;
    }
    return $arr;
}
//返回json act状态码  msg信息 data数据
function json_return($code=0,$msg='',$data=[],$url=''){
    header('Content-Type:application/json');
    $arr=arr_return($code,$msg,$data,$url);
    return json_encode($arr);
}
//验证
function check($param='ajax',$msg='参数错误',$type=1,$data=[]){
    if($param==='ajax'){if(!request()->isAjax()){echo '404';exit;}}
    else {
        switch ($type) {
            case 1: //判断是否为空
                if (empty($param)) {
                    echo json_return(0, $msg);
                    exit;
                }
                break;
            case 'pwd':
                if(strlen($param) < 6){
                    echo json_return(0, '密码长度不能小于6位！');
                    exit;
                }
                if(strlen($param) > 32){
                    echo json_return(0, '密码长度不能大于32位！');
                    exit;
                }
                if(preg_match("/[\x7f-\xff]/", $param)){
                    echo json_return(0, '密码不能含有中文哦！');
                    exit;
                }
                break;
            case 'html':
                $param=str_replace('<','《',$param);
                $param=str_replace('\'','“',$param);
                $param=str_replace('"','“',$param);
                break;
            case 'list':
                if(!in_array($param,$data)) {
                    echo json_return(0, $msg);
                    exit;
                }
                break;
            default:
                break;
        }
    }
    return $param;
}
//base64 方式上传图片 url 0不带域名 1带域名
function base64_upload_img($imgData,$path='/data/images',$url=0){
    //$imgdata = input('imgdata');
    $imgData = base64_decode($imgData);
    $folder = $path.'/' . date('Ymd');
    $filename = '.' . $folder . "/" . date('Ymdhis') . rand(100, 999) . ".jpg";
    if (!is_dir('.' . $folder)) {
        mkdir('.' . $folder, 0777, true);
    }
    $res = file_put_contents($filename, $imgData);
    if ($res > 0) {
        $filename=ltrim($filename, '.');
        if($url)$filename=request()->root(true).$filename;
        return arr_return(1, '上传成功',$filename );
    } else {
        return arr_return(0, '上传出错');
    }
}
