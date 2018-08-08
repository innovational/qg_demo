<?php
/**
 * Created by PhpStorm.
 * User: wenwu
 * Date: 2018/8/7
 * Time: 14:09
 */
namespace app\admin\controller;
use think\Db;

class Goods extends Common{
    public function index(){
        $shop_id=check(input('shop_id',1)*1);
        $where=['shop_id'=>$shop_id];
        $listObj=Db::name('qg_goods')->where($where)->paginate(10);
        $list=$listObj->items();
        $page=$listObj->render();
        $goodsObj=new \app\admin\model\Goods();
        $cateList = $goodsObj->cate;
        $this->assign('cateList', $cateList);
        return $this->fetch('',['list'=>$list,'page'=>$page]);
    }
    //添加编辑
    public function form(){
        $shop_id=check(input('shop_id',1)*1);
        $id=input('id');
        $goodsObj=new \app\admin\model\Goods();
        if($this->request->isPost()){
            $post=(input('post.'));
            $cate_id=check(input('cate_id'),'请选择分类');
            $amounts=check(input('amounts'),'请填写产品金额')*100;
            $name=check(input('name'),'请填写商品名称');
            $img_list=check(input('img_list'),'请至少上传一张图片');
            $desc=input('desc');
            if($id)$res=$goodsObj->edit($id,$cate_id,$name,$desc,$img_list,$amounts,$shop_id,$post);
            else $res=$goodsObj->add($cate_id,$name,$desc,$img_list,$amounts,$shop_id,$post);
            $res['url']='';
            return $res;
        }else {
            $attrList=$goodsObj->attrGroup;
            $cateList = $goodsObj->cate;
            if($id){
                $info=$goodsObj->get_data($id);
                $this->assign('info', $info);
            }
            $this->assign('cateList', $cateList);
            $this->assign('attrList', $attrList);
            return $this->fetch();
        }
    }
}