<?php
/**
 * Created by PhpStorm.
 * User: wenwu
 * Date: 2018/8/7
 * Time: 16:15
 */
namespace app\admin\model;
use think\Db;

class Models{
    protected $table='';
    public $info=null; //单条数据info
    public $cache=false; //单条数据是否缓存
    //初始化单条数据
    public function init_info($id,$field=true){
        if(!$this->table || !$id)return false;
        return $this->info=Db::name($this->table)->field($field)->where('id',$id)->find();
    }
    //获取单条数据
    public function get($id){
        if($this->cache){
            $this->get_cache($id);
        }
        if(empty($this->info)){
            $this->init_info($id);
            if($this->cache && $this->info){
                $this->save_cache($id,$this->info);
            }
        }
        return $this->info;
    }
    //获取缓存
    public function get_cache($id){
        return $this->info=cache($this->table.$id);
    }
    //更新缓存
    public function set_cache($id){
        $this->clear_cache($id);
        $this->get($id);
    }
    //存缓存 可以配置成redis
    public function save_cache($id,$value){
        cache($this->table.$id,$value);
    }
    //清除缓存
    public function clear_cache($id){
        cache($this->table.$id,null);
    }
}