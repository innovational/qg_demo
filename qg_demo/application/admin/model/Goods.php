<?php
/**
 * Created by PhpStorm.
 * User: wenwu
 * Date: 2018/8/7
 * Time: 18:34
 */
namespace app\admin\model;

use think\Db;

class Goods extends Models{
    public $table='qg_goods';
    public $cache=true;

    public $shop=[ // 以下格式可改为数据库灵活修改
        '1'=>['id'=>1,'name'=>'商家1'],
        '2'=>['id'=>2,'name'=>'商家2'],
        '3'=>['id'=>3,'name'=>'商家3'],
    ];
    public $cate=[
        '1'=>['id'=>1,'name'=>'分类1'],
        '2'=>['id'=>2,'name'=>'分类2'],
        '3'=>['id'=>3,'name'=>'分类3'],
    ];
    public $attrGroup=[
        '1'=>['id'=>1,'name'=>'规格'],
        '2'=>['id'=>2,'name'=>'颜色'],
        '3'=>['id'=>3,'name'=>'温度'],
    ];
    public function get_data($id){
        $info=$this->get($id);
        $info['attrList']=$this->get_attr($id);
        return $info;
    }
    //添加产品
    public function add($cate_id,$name,$desc,$img_list,$amounts,$shop_id,$post){
        $now_time=$_SERVER['REQUEST_TIME'];
        $data=['cate_id'=>$cate_id,'name'=>$name,'desc'=>$desc,'img_list'=>$img_list,'create_time'=>$now_time,'amounts'=>$amounts,'shop_id'=>$shop_id];
        if( Db::name($this->table)->where('name',$name)->value('id')){
            return arr_return(0,'该名称已存在');
        }
        Db::startTrans();
        if( $id=Db::name($this->table)->insertGetId($data)){
            $attr_name=$post['attr_name'];
            $attr_id=$post['shop_attr_id'];
            $var_amounts=$post['var_amounts'];
            $attrList=[];
            $op=true;
            if(count($attr_name)>0){
                foreach ($attr_name as $k=>$v){
                    if($v && $attr_id[$k])$attrList[]=['attr_id'=>$attr_id[$k],'shop_id'=>$shop_id,'goods_id'=>$id,'attr_name'=>$v,'var_amounts'=>$var_amounts[$k]*100,'create_time'=>$_SERVER['REQUEST_TIME']];
                }
            }
            if(!empty($attrList)){
                $attrWhere=['shop_id'=>$shop_id,'goods_id'=>$id];
                if($op=Db::name('qg_goods_attr')->where($attrWhere)->delete()!==false) {
                    $op=Db::name('qg_goods_attr')->insertAll($attrList);
                }
            }
            if($op) {
                Db::commit();
                $this->set_cache($id);
                $this->set_attr($id);
                return arr_return(1, '添加成功',$id);
            }
        }
        Db::rollback();
        return arr_return(0,'添加失败');
    }
    //编辑产品
    public function edit($id,$cate_id,$name,$desc,$img_list,$amounts,$shop_id,$post){
        $data=['cate_id'=>$cate_id,'name'=>$name,'desc'=>$desc,'img_list'=>$img_list,'amounts'=>$amounts,'shop_id'=>$shop_id];
        if( Db::name($this->table)->where(['name'=>$name,'id'=>$id])->value('id')){
            return arr_return(0,'该名称已存在');
        }
        Db::startTrans();
        if( Db::name($this->table)->where('id',$id)->update($data)!==false){
            $attr_name=$post['attr_name'];
            $attr_id=$post['shop_attr_id'];
            $var_amounts=$post['var_amounts'];
            $attrList=[];
            $op=true;
            if($attr_name && count($attr_name)>0){
                foreach ($attr_name as $k=>$v){
                    if($v && $attr_id[$k])$attrList[]=['attr_id'=>$attr_id[$k],'shop_id'=>$shop_id,'goods_id'=>$id,'attr_name'=>$v,'var_amounts'=>$var_amounts[$k]*100,'create_time'=>$_SERVER['REQUEST_TIME']];
                }
            }
            if(!empty($attrList)){
                $attrWhere=['shop_id'=>$shop_id,'goods_id'=>$id];
                if($op=Db::name('qg_goods_attr')->where($attrWhere)->delete()!==false) {
                    $op=Db::name('qg_goods_attr')->insertAll($attrList);
                }
            }
            if($op) {
                Db::commit();
                $this->set_cache($id);
                $this->set_attr($id);
                return arr_return(1, '修改成功', $id);
            }
        }
        Db::rollback();
        return arr_return(0,'修改失败');
    }
    //获取商品属性数据
    public function get_attr($goods_id){
        $attrList=cache('qg_goods_attr'.$goods_id);
        if(empty($attrList)) {
            $attrList = Db::name('qg_goods_attr')->where('goods_id', $goods_id)->select();
            cache('qg_goods_attr'.$goods_id,$attrList);
        }
        return $attrList;
    }
    //清空
    public function clear_attr($goods_id){
        cache('qg_goods_attr'.$goods_id,null);
    }
    //更新缓存数据
    public function set_attr($goods_id){
        $this->clear_attr($goods_id);
        $this->get_attr($goods_id);
    }
}