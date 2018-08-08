//上传图片类  基于 layer  jquery
	/* 使用方式
	var upload1=new UploadImage();
	var data={
	    btn_id:'', //你的上传按钮的id
        upload_url:'', //你的后台处理上传地址
        upload_success:function (res) {}
    }
	upload1.set_data(data);
	upload1.run();
	*/
//配置结束
function UploadImage(){
    this.img_londing_box=null; //提示上传中
    this.upload_url='' //你的后台处理上传地址
    this.btn_id=''; //你的按钮 id
    //上传成功回调*/
    this.upload_success=function (res) { //上传成功回调*/
        console.log(res);
        alert('上传成功，请配置回调方法');
    };
    //设置参数 {btn_id:btn_id,upload_url:upload_url,upload_success:upload_success}
    this.set_data=function (data) {
        var _this=this;
        //typeof(data)
        if(typeof data == "object"){
            if(data.btn_id) _this.btn_id = data.btn_id;
            if(data.upload_url) _this.upload_url=data.upload_url;
            if(data.upload_success)_this.upload_success=data.upload_success;
        }else{
            alert('参数格式不对');
        }
    }
    this.run=function () { //运行
        var _this=this;
        if(_this.upload_url==''){
            alert('请设置上传接口');
            return false;
        }
        if(_this.btn_id==''){
            alert('请设置上传按钮');
            return false;
        }
        $('#'+_this.btn_id).click(function(){
            if($('#file_img_select').length<=0) {
                $(this).parent().append('<input type="file" id="file_img_select" accept="image/*" mutiple="mutiple" style="display:none" />');
            }
            _this.bind_file_img();
            $('#file_img_select').click();
        });
    }
    //绑定事件
    this.bind_file_img=function () {
        var _this=this;
        $('#file_img_select').unbind();
        $('#file_img_select').change(function(e){
            var tmpimg = this.files[0];
            if(tmpimg){
                _this.img_londing_box=layer.msg('上传中...',{icon:16,time:20000,shade:[0.6,'#000']});
                var Cnv = document.createElement("Canvas");
                var Cntx = Cnv.getContext('2d');//获取2d编辑容器
                var imgss =   new Image();
                ImgSize = 480;
                var reader = new FileReader();
                reader.readAsDataURL(tmpimg);
                reader.onload = function (e) {
                    url = e.target.result;
                    imgss.src = url;
                    imgss.onload = function () {
                        //等比缩放
                        var m = imgss.width / imgss.height;
                        Cnv.height = ImgSize;//该值影响缩放后图片的大小
                        Cnv.width = ImgSize * m;
                        //img放入画布中
                        //设置起始坐标，结束坐标
                        Cntx.drawImage(imgss, 0, 0, ImgSize * m, ImgSize);
                        var imgsrc = Cnv.toDataURL("image/png");
                        var imgpic = imgsrc.replace(/^data:image\/(png|jpg);base64,/, "");
                        // $('#img123').attr('src', imgsrc)
                        /*   var imgString='<img class="img" src="'+imgsrc+'"/>';
                         $('#imgList').append(imgString);*/
                        _this.image_uploading(imgpic);
                    }
                }
            }
        });
    }
    //上传
    this.image_uploading=function (imgpic) {
        var _this=this;
        $.ajax({
            url:_this.upload_url,
            data:{
                imgdata:imgpic
            },
            type:'post',
            dataType:'json',
            success:_this.upload_success,
            error:function(){
                layer.msg('网络错误');
            },
            complete:function(){
                layer.close(_this.img_londing_box);
            }
        });
    }
}