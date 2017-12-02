;

/*

function get_list(response) {
    //歌曲列表
    var oMusicList=document.getElementById('music_list_list');
    var music_list=response[0].data.song;
    var music_id,
        music_name,
        music_singer,
        music_hash,
        music_duration;

    for (let i=0,len=music_list.length;i<len;i++){
        music_id=music_list[i].AlbumID;
        music_singer=music_list[i].singername;
        music_name=music_list[i].songname;
        music_hash=music_list[i].hash;
        music_duration=secondTo(music_list[i].duration/1000);
        var list_item=document.createElement('tr');
        list_item.setAttribute('data-id',music_id);
        list_item.setAttribute('data-hash',music_hash);
        list_item.setAttribute('class','list_item');
        var html='<td class="select"><input type="checkbox"></td> <td class="music_name" colspan="2">'+music_name+'</td> <td class="music_operation">播放</td> <td class="music_author">'+music_singer+'</td> <td class="music_length">'+music_duration+'</td>';
        list_item.innerHTML=html;
        oMusicList.appendChild(list_item);
    }

}
*/

// 绑定事件
function addHandler(element,type,handler) {
    if(element.addEventListener){
        element.addEventListener(type,handler);
    }else if(element.attachEvent){
        element.attachEvent('on'+type,handler);
    }else {
        element['on'+type]=handler;
    }
}

function removeHandler(element,type,handler) {
    if(element.removeEventListener){
        element.removeEventListener(type,handler);
    }else if(element.detachEvent){
        element.detachEvent('on'+type,handler);
    }else {
        element['on'+type]=null;
    }
}

//事件模拟(鼠标事件)
function simulate(element,type) {
    var event=document.createEvent('MouseEvent');
    event.initMouseEvent(type,true,true,document.defaultView,0,0,0,0,0,false,false,false,false,0,null);
    element.dispatchEvent(event);
}

//获取样式
function getStyle(element,attr) {
    if(getComputedStyle(element,null)){
        return window.getComputedStyle(element,null)[attr];
    }else {
        return element.currentStyle[attr];
    }
}

//将秒数转换为时间格式
function secondTo(second,num) {
    if(isNaN(second)){
        return '00:00';
    }
    var str='';
    var s=(second % 60).toFixed(num);
    var m=parseInt(second/60);
    if(s<10){
        s="0"+s;
    }
    if(s==60){
        s=59;
    }
    if(m<10){
        m='0'+m;
    }
    return str=m+":"+s;
}

//导入歌词
function set_lyric(str) {
    var oLyricItem=document.getElementById('lyric_item');
    oLyricItem.innerHTML="";
    var item_list=str.split('↵');
    for(let i=0,len=item_list.length;i<len;i++){
        var oP=document.createElement('p');
        var str_list=/(\[.*\])(.*)/.exec(item_list[i]);
        oP.innerHTML='<span>'+str_list[1]+'</span>'+str_list[2];
        oLyricItem.appendChild(oP);
    }
    //console.log(item_list)
}

//获取元素在文档中的定位
function getViewLeft(element) {
    var left=element.offsetLeft;
    var offset_parent=element.offsetParent;
    while (offset_parent!==null){
        left+=offset_parent.offsetLeft;
        offset_parent=offset_parent.offsetParent;
    }
    return left;
}
function getViewTop(element) {
    var top=element.offsetTop;
    var offset_parent=element.offsetParent;
    while (offset_parent!==null){
        top+=offset_parent.offsetTop;
        offset_parent=offset_parent.offsetParent;
    }
    return top;
}

//动画

function move_scroll(element,end,fn) {
    clearInterval(element.timer);
    element.timer=setInterval(function () {
        var current=parseInt(element.scrollTop);
        if(current===end){
            clearInterval(element.timer);
            if(fn){
                fn();
            }
        }else {
            var speed=(end-current)/50;
            speed=end>current?Math.ceil(speed):Math.floor(speed);
            if(element.scrollTo){  //ie不支持scrollTo()
                element.scrollTo(0,current+speed);
            }else {
                element.scrollTop=current+speed;
            }

        }
    },10);
}

window.onload=function () {

    var oBody=document.getElementsByTagName('body');
    //初始body高度等于窗口高度
    oBody.item(0).style.height=window.innerHeight+'px';

    //更改窗口大小body等于窗口高度
    window.onresize=function () {
        oBody.item(0).style.height=window.innerHeight+'px';
        //console.log(window.innerHeight);
    };

    //audio对象
    var oAudio=document.getElementById('current_play');

    //播放控件
    var oAddLike=document.getElementById('add_like'),
        oDownload=document.getElementById('download'),
        oOrder=document.getElementById('order'),
        oName=document.getElementById('progress_music_name'),
        oTimeCurrent=document.getElementById('progress_time_current'),
        oTimeAll=document.getElementById('progress_time_all'),
        oProgressAll=document.getElementById('progress_all_progress'),
        oProgressCurrent=document.getElementById('progress_current_progress'),
        oVolume=document.getElementById('volume'),
        oVolumeCurrent=document.getElementById('volume_current'),
        oVolumeAll=document.getElementById('volume_all'),
        oPer=document.getElementById('per_music'),
        oNext=document.getElementById('next_music'),
        oPlay=document.getElementById('play');
    

    var player=setInterval(function () {
        var all_time=oAudio.duration;
        var current_time=oAudio.currentTime;
        oTimeAll.innerHTML=secondTo(all_time,0);
        oTimeCurrent.innerHTML=secondTo(current_time,0);
        oProgressCurrent.style.width=parseInt(current_time/all_time*10000)/100+"%";
        var lyric_time=secondTo(current_time,2);
        var span_list=oLyric.getElementsByTagName('span');
        //调整歌词
        for(let i=0,len=span_list.length;i<len;i++){
            if(span_list[i].innerHTML==='['+lyric_time+']'){
                var current_lyric=oLyric.getElementsByClassName('current');
                for(let i=0,len=current_lyric.length;i<len;i++){
                    current_lyric[i].classList.remove('current');
                }
                span_list[i].parentNode.classList.add('current');
                move_scroll(oLyric,i*36);
               break;
            }
        }
        //判断结束
        if(oAudio.ended){
            switch (order_model){
                case 'queue':
                    if(oMusicList.getElementsByClassName('active')[0]!==oMusicList.lastElementChild){
                        simulate(oNext,'click');
                    }
                    break;
                case 'shuffle':
                    simulate(document.getElementsByClassName('list_btn')[Math.floor(Math.random()*(document.getElementsByClassName('list_btn').length))],'click');
                    break;
                case 'repeat_one':
                    simulate(oMusicList.getElementsByClassName('active')[0].getElementsByClassName('music_name')[0],'dblclick');
                    break;
                case 'repeat':
                    if(oMusicList.getElementsByClassName('active')[0]===oMusicList.lastElementChild){
                        simulate(oMusicList.firstElementChild.getElementsByClassName('music_name')[0],'dblclick');
                    }else {
                        simulate(oNext,'click');
                    }
                    break;

            }
        }
    },1);


    //播放按钮绑定
    oPlay.onclick=function () {
        if(this.getAttribute('class')==='pause'){
            oAudio.pause();
            this.setAttribute('class','play');
            this.innerHTML='<svg><use xlink:href="#play_icon"></use></svg>';
            oImg.classList.remove('active');
        }else {
            oAudio.play();
            this.setAttribute('class','pause');
            this.innerHTML='<svg><use xlink:href="#pause_icon"></use></svg>';
            oImg.classList.add('active');
        }
    };

    // 上一首
    oPer.onclick=function () {
        var current_item=oMusicList.getElementsByClassName('active').item(0);
        if(current_item.previousElementSibling){
            var per_item=current_item.previousElementSibling;
        }else {
            var per_item=current_item;
        }
        simulate(per_item.getElementsByClassName('list_btn')[0],'click');
    };

    //下一首
    oNext.onclick=function () {
        var current_item=oMusicList.getElementsByClassName('active').item(0);
        if(current_item.nextElementSibling){
            var per_item=current_item.nextElementSibling;
        }else {
            var per_item=current_item;
        }
        simulate(per_item.getElementsByClassName('list_btn')[0],'click');
    };

    //进度调节

    function set_progress(ev) {
        var event=ev||window.event;
        var current_length=event.clientX-getViewLeft(oProgressAll);
        oAudio.currentTime=parseInt(current_length/parseInt(getStyle(oProgressAll,'width'))*100)/100*oAudio.duration;
        oProgressCurrent.style.width=current_length+'px';
    }

    oProgressAll.onmousedown=function (ev) {
        set_progress(ev);
        addHandler(document,'mousemove',set_progress);
    };
    document.onmouseup=function () {
        removeHandler(document,'mousemove',set_progress);
    };


    // 音量开关绑定
    oVolume.onclick=function () {
        if(this.getAttribute('class')==='on'){
            oAudio.volume=0;
            this.setAttribute('class','off');
            this.innerHTML='<svg><use xlink:href="#mute_icon"></use></svg>';
            oVolumeCurrent.style.backgroundColor="#d1d1d1";
        }else {
            oAudio.volume=parseInt(parseInt(getStyle(oVolumeCurrent,'width'))/parseInt(getStyle(oVolumeAll,'width'))*10)/10;
            this.setAttribute('class','on');
            this.innerHTML='<svg><use xlink:href="#voice_icon"></use></svg>';
            oVolumeCurrent.style.backgroundColor="#ffffff";
        }
    };

    //音量调节
    function set_volume(ev) {
        oVolume.setAttribute('class','on');
        oVolume.innerHTML='<svg><use xlink:href="#voice_icon"></use></svg>';
        oVolumeCurrent.style.backgroundColor="#ffffff";
        var event=ev||window.event;
        var current_length=event.clientX-getViewLeft(oVolumeAll);
        oAudio.volume=parseInt(current_length/parseInt(getStyle(oVolumeAll,'width'))*10)/10;
        oVolumeCurrent.style.width=current_length+'px';
    }

    oVolumeAll.onmousedown=function (ev) {
        set_volume(ev);
    };

    //列表循环模式切换
    var order_model="queue";

    oOrder.onclick=function () {
        var current_order=oOrder.getAttribute('class');
        switch (current_order){
            case 'queue':
                order_model="shuffle";
                oOrder.innerHTML='<svg><use xlink:href="#shuffle_icon"></use></svg>';
                oOrder.setAttribute('class','shuffle');
                oOrder.setAttribute('title','随机播放');
                break;
            case 'shuffle':
                order_model="repeat";
                oOrder.innerHTML='<svg><use xlink:href="#repeat_icon"></use></svg>';
                oOrder.setAttribute('class','repeat');
                oOrder.setAttribute('title','列表循环');
                break;
            case 'repeat':
                order_model="repeat_one";
                oOrder.innerHTML='<svg><use xlink:href="#repeat_one_icon"></use></svg>';
                oOrder.setAttribute('class','repeat_one');
                oOrder.setAttribute('title','单曲循环');
                break;
            case 'repeat_one':
                order_model="queue";
                oOrder.innerHTML='<svg><use xlink:href="#queue_icon"></use></svg>';
                oOrder.setAttribute('class','queue');
                oOrder.setAttribute('title','顺序播放');
                break;
        }
    };


    //获取播放列表
/*

    var script=document.createElement('script');
    script.setAttribute('type','text/javascript');
    script.src='http://so.service.kugou.com/get/complex?word=%E8%AE%B8%E5%B5%A9&_='+Date.now()+'&callback=get_list';
    document.body.appendChild(script);

*/

    // 点击播放
    var oMusicList=document.getElementById('music_list_list');
    var oImg=document.getElementById('cover_img');
    var oBackImg=document.getElementById('back_img');
    var oLyric=document.getElementById('lyric_list');
      //列表双击播放
    addHandler(oMusicList,'dblclick',function (ev) {
        var event=ev||window.event;
        var target=event.target||event.srcElement;
        if(target.classList.contains('music_name')){
            try {
                oMusicList.getElementsByClassName('active').item(0).getElementsByClassName('music_operation')[0].innerHTML='<svg class="list_btn"><use xlink:href="#list_play_icon"></use></svg>';
                oMusicList.getElementsByClassName('active').item(0).classList.remove('active');
            }
            catch (err){

            }
            // 列表行更改
            target.parentNode.classList.add('active');
            //列表按钮更改
            oMusicList.getElementsByClassName('active').item(0).getElementsByClassName('music_operation')[0].innerHTML='<svg><use xlink:href="#list_pause_icon"></use></svg>';
            //oAudio.src=target.parentNode.getAttribute('data-src');
            oAudio.setAttribute('src',target.parentNode.getAttribute('data-src'));
            //歌曲名更改
            oName.innerHTML=target.innerHTML;
            //歌词更改
            set_lyric(target.parentNode.getAttribute('data-lyric'));
            //重置歌词位置
            //oLyric.scrollTo(0,0);
            oLyric.scrollTop=0;
            // 播放按钮更改
            oPlay.setAttribute('class','pause');
            oPlay.innerHTML='<svg><use xlink:href="#pause_icon"></use></svg>';
            oImg.classList.add('active');
            //oBackImg.src=oImg.src=target.parentNode.getAttribute('data-img');
            oImg.setAttribute('src',target.parentNode.getAttribute('data-img'));
            oBackImg.setAttribute('src',target.parentNode.getAttribute('data-img'));
            // 背景图更改
            oImg.classList.add('active');
        }
        if(event.preventDefault){
            event.preventDefault();
        }else {
            event.returnValue=false;
        }
    });
       //列表按钮单击播放
    oMusicList.onclick=function (ev) {
        var event=ev||window.event;
        var target=event.target||event.srcElement;
        if(target.classList.contains('list_btn')){
            simulate(target.parentNode.previousElementSibling,'dblclick');
        }
    };


    //全选条目
    var oSelect_allList=document.getElementById('select_list');
    oSelect_allList.onclick=function () {
        var input_list=oMusicList.getElementsByTagName('input');
        if(this.checked){
            for (var i=0,len=input_list.length;i<len;i++){
                input_list[i].checked=true;
            }
        }else {
            for (let i=0,len=input_list.length;i<len;i++){
                input_list[i].checked=false;
            }
        }
    };

    //删除条目
    var oDelete=document.getElementById('delete_item');
    oDelete.onclick=function () {
        var oSelected=oMusicList.getElementsByTagName('input');
        for(let i=0,len=oSelected.length;i<len;i++){
            if(oSelected[i].checked){
                oMusicList.removeChild(oSelected[i].parentNode.parentNode);
                console.log(i);
                len--;
                i=-1;//删除后节点个数变化，使i重置为0，从头遍历；
            }
        }
    };

    // 清空列表
    var oClear=document.getElementById('clear_list');
    oClear.onclick=function () {
        oMusicList.innerHTML='';
    };

    //初始播放第一首歌曲
    simulate(oMusicList.firstElementChild.getElementsByClassName('music_name')[0],'dblclick');


};

