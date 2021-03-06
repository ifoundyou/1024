;(function(root,factory){
    //此处应该require入依赖，由于没有加入自动管理依赖技术，所以，将依赖注入到全局，通过全局的方式引入依赖。
    //require angular,_,$,ldzx
    factory.call(root,angular,_,$,ldzx);//将依赖注入模块工厂，并运行工厂;
}(this,function(angular,_,$,ldzx){
    //以下是模块逻辑，并采用严格模式，保证代码更加符合规范，编译时，应运行jhint,保证团队代码的风格一致，符合规范。
    'use strict';
    //定义控制器模块，并为所有视图注册对应的控制器
    var appControllers=angular.module('appControllers',[]);
    appControllers.
        controller('selectController',['$scope','$routeParams','magaProvider','$rootScope','magasProvider','$http',selectController]).
        controller('makeController',['$scope','$routeParams','magaProvider','$rootScope','magasProvider','$http','parseDataProvider','transformDataProvider',makeController]).
        controller('previewController',['$scope','$routeParams','magaProvider','$rootScope','magasProvider','$http','parseDataProvider','transformDataProvider',previewController]).
        controller('musicController',['$scope','$routeParams','magaProvider','$window','$rootScope','magasProvider','$http',musicController]).
        controller('textController',['$scope','$routeParams','magaProvider','$window','$rootScope','$http','magasProvider',textController]).
        controller('lotteryController',['$scope','$routeParams','magaProvider','$window','$rootScope','magasProvider','$http',lotteryController]).
        controller('wechatController',['$scope','$routeParams','magaProvider','$window','$rootScope','magasProvider','$http','transformDataProvider',wechatController]).
        controller('shapesController',['$scope','$routeParams','magaProvider','$window','$rootScope','magasProvider','$http','transformDataProvider',shapesController]).
        controller('shapeController',['$scope','$routeParams','magaProvider','$window','$rootScope','magasProvider','$http','transformDataProvider',shapeController]).
        controller('hyperLinkController',['$scope','$routeParams','magaProvider','$window','$rootScope','magasProvider','$http',hyperLinkController]);
    //下面几个函数，即控制器的逻辑主体，依赖zepto的ajax和underscore数据处理功能，和angular无关了，angualr仅仅是负责调用这些模块并注入依赖，而我们只负责注册函数的定义，不再调用函数，即控制反转和依赖注入;
    //
    //
    //
    //选择模板页面控制器    
    function selectController($scope,$routeParams,magaProvider,$rootScope,magasProvider,$http){
        //vm层调用data层接口读取远程服务器数据，并再$scope对象上注册数据以及简单操作，以及调用service层逻辑
        //vm层应该非常薄，将可重复利用的逻辑提取到service里       
        ldzx.request
            .getCovers()//ajax读取远程数据
            .then(function(data){//读取远程数据
                if(data.code=200){
                    $scope.elements=data.obj;//vm层注册远程数据
                    data.obj.unshift({//默认数据
                        imagePic:"img/img-default.jpg",
                        id:"0",
                        varName:"自定义模板",
                        order:0
                    });
                    $scope.$apply(function(){});
                }
            });
        //vm的数据
        $scope.modelId=null;//用户选择的模板url
        $scope.mubanId=null;//用户选择的模板id
        //vm的操作
        $scope.controller=function(){
            return false;
        };
        $scope.back_btn=function(){
            var hash=window.location.hash;
            hash=hash.replace(/(\-[\w\d:]{0,100}\-)/g,'');
            hash=hash+'-back_btn-';
            window.location.hash=hash;
        };
        $scope.show=function(id,name,mubanId){//弹出对话框
            $('.inputName').removeClass('hide').addClass("sZoom");
            $scope.modelId=id;
            $scope.modelName=name;
            $scope.mubanId=mubanId;
            //$(window).on('touchmove.scroll',$scope.controller);
        };
        $scope.make=function(modelId,modelName,magazineName){
            //用户从对话框进入下个页面
            // magaProvider.modelId=modelId;//模板编号放入当前杂志服务
            // magaProvider.modleName=modelName;
            // magaProvider.magazineName=magazineName;
            // console.log($scope.modelName)
             var getBLen = function(str) {
                if (str == null) return 0;
                    if (typeof str != "string"){
                    str += "";
                }
                return str.replace(/[^x00-xff]/g,"01").length;
             }
             
            if($scope.magazineName){
                if(getBLen($scope.magazineName)>24)
                {   
                    $('.layer-text').val("").addClass('layer-error').attr("placeholder","大于24个字符，请重新输入");
                    
                }else{
                    var newMaga=new magaProvider;
                    newMaga.name=$scope.magazineName||'untitled';
                    // newMaga.id=data.obj;
                    newMaga.modelUrl=modelId;
                    newMaga.modelName=modelName;
                    newMaga.mubanId=$scope.mubanId;
                    magasProvider.addMaga(newMaga);//增加一个杂志
                    window.location.hash='/make';
                }
     
            }else{
                $('.layer-text').addClass('layer-error').attr("placeholder","请输入杂志名称（小于24个字符）");
            }            
        };
    }

    //制作页面控制器
    function makeController($scope,$routeParams,magaProvider,$rootScope,magasProvider,$http,parseDataProvider,transformDataProvider){
        // console.log($scope);
        
        ldzx.ctrl.stop();
        var newMaga=magasProvider.getNewMaga();
        
        if(!newMaga){
            window.location.hash='/';
            return;
        }
        if( newMaga.mubanId == 0){

             newMaga.active=-1;
             newMaga.addPage();
             newMaga.mubanId=1;   
        }
        window.$scope=$scope;
        // console.log(newMaga);
        $scope.name=newMaga.name==='untitled'?'未命名':newMaga.name;
        $scope.music=newMaga.music=newMaga.music||{};
        $scope.id=newMaga.id;
        $scope.pages=newMaga.pages;
        $scope.state={};
        $scope.state.active=newMaga.active;
        window.magasProvider=window.magasProvider||magasProvider;//暴漏到root对象，ios和android调用
        function request(){
            var backMaga=transformDataProvider(newMaga); 
        console.log(newMaga)              
        console.log(backMaga)              
            $.ajax({
                'url':'http://mookservice.5.cn/inner/magazine/addOne.json',
                'type':"POST",
                'data':{'params':JSON.stringify(backMaga)},
                'success':function(data){
                    console.log('rest success');
                }
            });
        }
        var req=_.debounce(request,1000,true);
        $scope.rest=function(){
            //ios api
            // magasProvider.replaceImg('webview_5','fdsafdsa');
            // magasProvider.addFloatage('page_2','img/1.png','image')
            // magasProvider.replaceBk('page_2','img/img04.jpg')
            // var backMaga=transformDataProvider(newMaga); 
            // // console.log($scope)           
            // $.ajax({
            //     // 'url':'http://mookservice.5.cn/inner/magazine/addOne.json',
            //     'url':'model/page.json',
            //     'type':"POST",
            //     'data':{'params':JSON.stringify(backMaga)},
            //     'success':function(data){
            //         console.log('rest success');
            //     }
            // });
            
            req();
            window.location.hash='/preview';
        };
        $scope.modelName=magaProvider.modelName;
        $scope.modelId=magaProvider.modelId;
        $scope.copyPage=function(){
            if($scope.pages.length===0){
                return;
            }
            var copy=$scope.pages[$scope.state.active];
            var newCopy=$.extend(true,{},copy);
            _.each(newCopy.floatages,
                function(floatage,index){
                    // if(floatage.uniqueId){
                        floatage.uniqueId=_.uniqueId('floatage_');
                    // }
                });
            newCopy.uniqueId=_.uniqueId('page_');
            $scope.pages.splice($scope.state.active+1,0,newCopy);
            $scope.state.active++;
            newMaga.active++;
            window.location.hash='/make/'+Math.random();
        };
        $scope.deletePage=function(){
            $scope.pages.splice($scope.state.active,1);
            if($scope.state.active===$scope.pages.length){
                $scope.state.active--;
                newMaga.active--;
            }
        };
        $scope.addPage=function(){
            newMaga.addPage();
            window.location.hash='/make/'+Math.random();
            $scope.state.active=newMaga.active;
        };
        $scope.bk_btn=function(){
            var hash=window.location.hash;
            hash=hash.replace(/(\?\-[\w\d:]{0,100}\-)/g,'').replace(/[\.\d]{1,}/,'');
            hash=hash+'?-bk_btn:'+newMaga.pages[newMaga.active].uniqueId+'-'+Math.random();
            newMaga.flOrBk='background';
            window.location.hash=hash;
        };
        $scope.img_btn=function(){
            var hash=window.location.hash;
            newMaga.flOrBk='floatage';
            hash=hash.replace(/(\?\-[\w\d:]{0,100}\-)/g,'').replace(/[\.\d]{1,}/,'');
            hash=hash+'?-img_btn:'+newMaga.pages[newMaga.active].uniqueId+'-'+Math.random();
            window.location.hash=hash;
        };
        if(!newMaga.pages[0]){
            ldzx.request.getMagazine().
                then(function(data){
                    if(!newMaga.pages[0]){//制作页面读取远程数据,生成第一页
                        var maga=parseDataProvider(data);
                        var pages=maga.pages;
                        $scope.pages=newMaga.pages=pages;
                        $scope.music=newMaga.music=maga.music;
                        $scope.id=maga.id=newMaga.id;
                        $scope.wgUser=newMaga.wgUser=maga.wgUser;
                        $scope.state.active=0;
                        newMaga.active=0;
                        $scope.$apply(function(){});
                    }
                });
            
        }
        // $.ajax({
        //     url:'http://mookservice.5.cn/inner/magazine/getmagazineOneByTopic.json',
        //     type:'post',
        //     dataType:'json',
        //     data:{"params":JSON.stringify({"topicid":"84009"})},
        //     success:function(data){
        //         $scope.$apply(function(){
        //             if(!newMaga.pages[0]){//制作页面读取远程数据,生成第一页
        //                 console.log(data);
        //                 var maga=parseDataProvider(data);
        //                 console.log(maga);
        //                 var pages=maga.pages;
        //                 $scope.pages=newMaga.pages=pages;
        //                 $scope.music=newMaga.music=maga.music;
        //                 $scope.id=newMaga.id=maga.id;
        //                 $scope.wgUser=newMaga.wgUser=maga.wgUser;
        //                 $scope.state.active=0;
        //                 newMaga.active=0;
        //             }
        //         });
        //     }
        // });
        $scope.swift=magaProvider.swift;//功能菜单的切换
        $scope.control=function(){
            magaProvider.swift=!magaProvider.swift;
            $scope.swift=magaProvider.swift;
        };
        $scope.back=function(){
            newMaga.activeText=0;
            window.location.hash='/';
        };
        $scope.text=function(){
            window.location.hash='/text';
        };
        $scope.lottery=function(){
            window.location.hash='/lottery';
        };
        $scope.audio=function(){
            window.location.hash='/music';
        };
        $scope.audio=function(){
            window.location.hash='/music';
        };
        $scope.hyperLink=function(){
            window.location.hash='/hyperLink';
        };
        
    }
    
    //素材们页控制器
    function shapesController($scope,$routeParams,magaProvider,$window,$rootScope,magasProvider,$http,transformDataProvider){
        ldzx.ctrl.start();
        var maga=magasProvider.getNewMaga();
        if(!maga){
            window.location.hash='/';
            return;
        }
		// maga.addPage()
        $scope.current=0;
        $scope.shapes=$scope.shapes||[];
        $http({
            method:'get',
            url:'http://mookservice.5.cn/image/group/list.json',
        }).
            success(function(data){
                if(data.code===200){
                    $scope.shapeTypes=data.obj;
                    $http({
                        method:'get',
                        url:$scope.shapeTypes[0].func
                    }).
                        success(function(data){
                            if(data.code===200){
                                $scope.shapes=$scope.shapes||[];
                                $scope.shapes.splice(0,0,data.obj);
                            }
                        });
                }
            });
        $scope.request=function(index){
            if($scope.shapes[index]){
                $scope.current=index;
            }else{

                $scope.current=index;
                $http({
                        method:'get',
                        url:$scope.shapeTypes[index].func
                    }).
                        success(function(data){
                            if(data.code===200){
                                $scope.shapes=$scope.shapes||[];
                                // $scope.shapes.splice(index,0,data.obj);
                                $scope.shapes[index]=data.obj;
                                console.log(data.obj)
                                $scope.current=index;
                            }
                        });
            }
        };
        $scope.toShape=function(index){ 
            ldzx.ctrl.stop();
            maga.shapeUrl=$scope.shapes[$scope.current][index].url;
            window.location.hash='/shape';
        }
        $scope.back=function(index){
            ldzx.ctrl.stop();
            window.location.hash='/make';
        }
    }//素材页控制器
    function shapeController($scope,$routeParams,magaProvider,$window,$rootScope,magasProvider,$http,transformDataProvider){
        ldzx.ctrl.stop();
        var maga=magasProvider.getNewMaga();
        if(!maga){
            window.location.hash='/';
            return;
        }
        $scope.url=maga.shapeUrl;
        $scope.addFloatage=function(url){
            if(maga.flOrBk=='floatage'){
                magasProvider.addFloatage(null,url,'shape');
                window.location.hash='/make';
            }else if(maga.flOrBk=='background'){
                magasProvider.replaceBk(maga.pages[maga.active].uniqueId,url);
                window.location.hash='/make';
            }
        };
        $scope.shapes=function(){
            window.location.hash='/shapes';
        };
    }
    //微信分享页面控制器
    function wechatController($scope,$routeParams,magaProvider,$window,$rootScope,magasProvider,$http,transformDataProvider){
        ldzx.ctrl.stop();
        var maga=magasProvider.getNewMaga();
        if(!maga){
            window.location.hash='/';
            return;
        }
        maga.wx=maga.wx||{};
        $scope.con=maga.wx.con;
        $scope.title=maga.wx.title;
        $scope.img=maga.wx.img;
        $scope.$watch('con',function(oldV,newV,scope){
            maga.wx.con=$scope.con;
        });
        $scope.$watch('title',function(oldV,newV,scope){
            maga.wx.title=$scope.title;
        });
        // $scope.$watch('img',function(oldV,newV,scope){
        //     maga.wx.img=$scope.img;
        // });
        function request(){
            maga.wx.con=$scope.con;
            maga.wx.title=$scope.title;
            // maga.wx.img=$scope.img;
            if(maga.wx.con&&maga.wx.con&&maga.wx.img){
                // alert(4)
                // var backMaga=transformDataProvider(maga);           
                // $.ajax({
                //     'url':'http://mookservice.5.cn/inner/magazine/addOne.json',
                //     'type':"POST",
                //     'data':{'params':JSON.stringify(backMaga)},
                //     'success':function(data){
                //         console.log('rest success');
                //     }
                // });
                //zid type must be string
                $.ajax({
                    'url':'http://mookservice.5.cn/inner/magazine/publishImg.json',
                    'type':"post",
                    'dataType':'json',
                    'data':{'params':JSON.stringify({
                        zid:maga.id+'',
                        biaoti:maga.wx.title,
                        miaoshu:maga.wx.con,
                        imgePic:maga.wx.img
                    })},
                    'success':function(data){
                        if(data.code==200){
                            console.log('wechat success');
                            window.location.hash='draftBox';
                        }
                    },
                    'error':function(){
                        window.location.hash='wechatError';
                    }
                });
            }else{
                alert('请输入微信标题、内容、分享图片')
            }
        }
        var req=_.debounce(request,1000);
        $scope.rest=function(){
            //ios api
            // magasProvider.replaceImg('webview_5','fdsafdsa');
            // magasProvider.addFloatage('page_2','img/1.png','image')
            // magasProvider.replaceBk('page_2','img/img04.jpg')
            // maga.wx={
            //     con:$scope.con,
            //     title:$scope.title,
            //     img:$scope.img
            // };
            req();
        };

        $scope.back=function(){
            window.location.hash='/make';
        };
        $scope.upload=function(){
            window.location.hash='/wechat/-shareImg_btn-/'+Math.random();
        };

    }
    //预览页面控制器
    function previewController($scope,$routeParams,magaProvider,$rootScope,magasProvider,$http,parseDataProvider,transformDataProvider){
        ldzx.ctrl.stop();
        var maga=magasProvider.getNewMaga();
        if(!maga){
            window.location.hash='/';
            return;
        }
        var newMaga=$.extend(true,{},maga);
        newMaga.active=0;
        $scope.name=newMaga.name==='untitled'?'未命名':newMaga.name;
        $scope.music=newMaga.music;
        $scope.pages=newMaga.pages;
        $scope.wgUser=newMaga.wgUser;
        $scope.state={};
        $scope.state.active=newMaga.active;
        $scope.rest=function(){
            var backMaga=transformDataProvider($scope); 
            console.log(newMaga)           
            console.log(backMaga);           
            $.ajax({
                'url':'http://172.16.168.251:8080/magazine_interface/inner/magazine/addOne.json',
                'type':"POST",
                'data':{'params':JSON.stringify(backMaga)},
                'success':function(data){
                    console.log('rest success');
                }
            });
        };
        $scope.modelName=magaProvider.modelName;
        $scope.modelId=magaProvider.modelId;
        $scope.back=function(){
            window.location.hash='/make';
        };
        $scope.wechat=function(){
            window.location.hash='/wechat';
        };
    }
    //音乐页面控制器
    function musicController($scope,$routeParams,magaProvider,$window,$rootScope,magasProvider,$http){
        ldzx.ctrl.start();
        var newMaga=magasProvider.getNewMaga();

        if(!newMaga){
            window.location.hash='/';
            return;
        }
        $scope.pages=newMaga.pages;
		$scope.currentId=newMaga.music.musicId;
        $scope.tempMusic=null;
        // $http({
        //         method:'GET',
        //         url:'model/music.json'
        //     }).
        //     success(function(data){
        //         $scope.musics=data;
        //     });
        $.ajax({
            'url':'http://mookservice.5.cn/mp3/list.json',
            'dataType':'json',
            'type':'post',
            'data':{'type':'1'},
            'success':function(data){
                var music=_.groupBy(data.obj,
                    function(item,index){
                        return item.type
                    });
                var iDontWantRepeatButWhy=_.map(music,
                    function(item,index){
                        return {
                            'type':index,
                            'list':_.map(item,
                                function(item,index){
                                    return {
                                        musicId:item.id,
                                        musicName:item.name,
                                        src:item.link,
                                        switch:false
                                    }
                                })
                        }
                    });
                $scope.$apply(function(){
                    $scope.musics=iDontWantRepeatButWhy;
                });
            }
        });
        //点击返回
        $scope.back=function(){
            window.location.hash="/make"
        };
        //选取音乐
		$scope.fw=false;
        $scope.setMusic=function(id,src){

            $scope.id=id;
            $scope.src=src;
        };
        //点击完成
        $scope.yes=function(){
            newMaga.music.musicId=$scope.id;
            newMaga.music.src=$scope.src;
        };
        $scope.addMusic=function(){
            
        };
    }

    //编辑文本页面控制器
    function textController($scope,$routeParams,magaProvider,$window,$rootScope,$http,magasProvider){
        
        if(!magasProvider.getNewMaga()){
            window.location.hash='/';
            return;
        }
		var maga=magasProvider.getNewMaga();
		 if(maga.activeText)
		 {
			 $scope.value=maga.activeText.value.join('\n');
			 $scope.fontSize = maga.activeText.style.fontSize;
			 $scope.fontcolor = maga.activeText.style.color;
			 $scope.backcolor = maga.activeText.style.backgroundColor;
             $scope.thisAlign = maga.activeText.style.textAlign;
		 }
		 

		
		$scope.success_text=function(){
            
			if(maga.activeText)
			{
				maga.activeText.value=$scope.value.split('\n');
				maga.activeText.style.fontSize = $scope.fontSize;
				maga.activeText.style.color = $scope.fontcolor;
				maga.activeText.style.backgroundColor = $scope.backcolor;
                maga.activeText.style.textAlign = $scope.thisAlign;	
		 	}else{
				$scope.addFloatage();
			}
			maga.activeText=0;
			
		}
        //点击返回
        $scope.back=function(){
            window.location.hash="/make"
        };
        //点击完成
        $scope.yes=function(){
            if($scope.text){
                magaProvider.texts.push($scope.text);
            }

            if(!$scope.value) 
            { 
                alert("请输入您要编辑的内容"); 
                
            }else{
                $scope.success_text();
                $scope.back();
            }
        };
        //
        $scope.aligns = [
            {"name" : "左对齐" , "val":"left"},
            {"name" : "中对齐" , "val":"center"},
            {"name" : "右对齐" , "val":"right" }
        ];
        
        $scope.setAligh=function(index){
            $scope.thisAlign = $scope.aligns[index].val;
        }
        
        $scope.colors = [
            {"name":"","val":"#000000"},
            {"name":"","val":"#ffffff"},
            {"name":"","val":"#3c3c3c"},
            {"name":"","val":"#5e5f8b"},
            {"name":"","val":"#feff28"},
            {"name":"","val":"#feb938"},
            {"name":"","val":"#ff6e3f"},
            {"name":"","val":"#e9402d"},
            {"name":"","val":"#e83f56"},
            {"name":"","val":"#fe6d96"},
            {"name":"","val":"#fe9eff"},
            {"name":"","val":"#d081fe"},
            {"name":"","val":"#945afe"},
            {"name":"","val":"#4b4efb"},
            {"name":"","val":"#0078f1"},
            {"name":"","val":"#0036c1"},
            {"name":"","val":"#0078f1"},
            {"name":"","val":"#00b3f3"},
            {"name":"","val":"#00d37e"},
            {"name":"","val":"#76e115"},
            {"name":"","val":"#c3ff2e"},
        ];
        
        //背景色
        $scope.backcolorFn = function(n){
            $scope.backcolor = $scope.colors[n].val;
            // $scope.backcolorname = $scope.colors[n].name;
        }
        
        //字体颜色
        $scope.fontcolorFn = function(n){
            $scope.fontcolor = $scope.colors[n].val ;
            // $scope.fontcolorname = $scope.colors[n].name;
        }
        //增加一个漂浮物
        $scope.addFloatage=function(){
            var maga=magasProvider.getNewMaga();
            console.log(maga.pages.length,maga.active)
            console.log(maga.pages[maga.active])
            maga.pages[maga.active].floatages.push({
                effects:[],
                style:{
                    color:$scope.fontcolor,
                    backgroundColor:$scope.backcolor,
                    textAlign:$scope.thisAlign,
                    width:'640px',
                    height:'auto',
                    top:'200px',
                    left:0,
                    fontSize:$scope.fontSize||'30px'
                },
                type:'text',
                value:$scope.value.split('##'),
                uniqueId:_.uniqueId('floatage_')
            });

           
        };
    }

    //涂抹页面控制器
    function lotteryController($scope,$routeParams,magaProvider,$window,$rootScope,magasProvider,$http){
        if(!magasProvider.getNewMaga()){
            window.location.hash='/';
            return;
        }
        var data={
            "imgs":[
                {
                    "src": "img/img05.jpg",
                    "name":"名字1"
                },
                {
                    "src": "img/img05.jpg",
                    "name":"名字2"
                },
                {
                    "src": "img/img05.jpg",
                    "name":"名字3"
                }
            ],
            "show":false,
            "column":["15%","30%","60%"]
        };
        $scope.lottery=data;
        $scope.lottery.this_effects = $scope.lottery.imgs[0].name;
        $scope.lottery.src=$scope.lottery.imgs[0].src;
        $scope.lottery.getthis=function(n)
            {
                $scope.lottery.act=n;   
        };
        //点击返回
        $scope.back=function(){
            window.location.hash="/make"
        };
        //点击完成
        $scope.yes=function(){
            var maga=magasProvider.getNewMaga();
            var page=maga.pages[maga.active];
            var value={
                name:$scope.lottery.this_effects,
                scale:parseInt($scope.lottery.column[$scope.lottery.act]),
                content:$scope.content,
                src:$scope.lottery.src
            };
            var lottery=_.findWhere(page.effects,{'type':'lottery'});
            if(lottery){
                lottery.value=value;
                lottery.ended=false;
            }else{
                page.effects.push({
                    type:'lottery',
                    value:value,
                    ended:false
                });
            }
        };
        //     $http({
        //             method:'GET',
        //             url:'model/lottery.json'
        //         }).
        //         success(function(data){
        //             $scope.lottery=data;
    				// $scope.lottery.this_effects = $scope.lottery.imgs[0].name;
        //             $scope.lottery.src=$scope.lottery.imgs[0].src;
        //             $scope.lottery.getthis=function(n)
        //                 {
        //                     $scope.lottery.act=n;   
        //             };
        //     });
		$scope.choose=function(index){
			$scope.lottery.this_effects=$scope.lottery.imgs[index].name;
            $scope.lottery.src=$scope.lottery.imgs[index].src;
			$scope.lottery.show = false;
		}
		
    }

    //超链接页面控制器
    function hyperLinkController($scope,$routeParams,magaProvider,$window,$rootScope,magasProvider,$http){
        if(!magasProvider.getNewMaga()){
            window.location.hash='/';
            return;
        }
        //点击返回
        $scope.back=function(){
            window.location.hash="/make"
        };
        //点击完成
        $scope.yes=function(){
            if(!$scope.value)
                {
                    alert("请输入文字") 
                    
                }
            else{
                    $scope.addFloatage();
                    $scope.back();
                }
            
        };
        //增加一个漂浮物
        $scope.addFloatage=function(){

            var maga=magasProvider.getNewMaga();
            var href=$scope.href;
            if(href){
                href=href.replace('http://','');
            }else{
                href='www.5.cn';
            }
            maga.pages[maga.active].floatages.push({
                effects:[],
                style:{
                    color:$scope.fontcolor,
                    backgroundColor:$scope.backcolor,
                    fontSize:$scope.fontSize,
                    borderRadius:$scope.radius,
                    width:'auto',
                    height:'auto',
                    textAlign:'center',
                    left:'0',
                    top:'300px',
                    padding:'20px',
                    wordBreak:'break-all',
                },
                type:'btn',
                href:href,
                value:$scope.value,
                uniqueId:_.uniqueId('floatage_')
            });
        };
	
    	$scope.colors = [
            {"name":"","val":"#000000"},
    	 	{"name":"","val":"#ffffff"},
            {"name":"","val":"#3c3c3c"},
            {"name":"","val":"#5e5f8b"},
            {"name":"","val":"#feff28"},
            {"name":"","val":"#feb938"},
            {"name":"","val":"#ff6e3f"},
            {"name":"","val":"#e9402d"},
            {"name":"","val":"#e83f56"},
            {"name":"","val":"#fe6d96"},
            {"name":"","val":"#fe9eff"},
            {"name":"","val":"#d081fe"},
            {"name":"","val":"#945afe"},
            {"name":"","val":"#4b4efb"},
            {"name":"","val":"#0078f1"},
            {"name":"","val":"#0036c1"},
            {"name":"","val":"#0078f1"},
            {"name":"","val":"#00b3f3"},
            {"name":"","val":"#00d37e"},
            {"name":"","val":"#76e115"},
            {"name":"","val":"#c3ff2e"},
    	 ];
	 
    	//背景色
    	$scope.backcolorFn = function(n){
    		$scope.backcolor = $scope.colors[n].val || "#000";
    		// $scope.backcolorname = $scope.colors[n].name;
    	}
    	
    	//字体颜色
    	$scope.fontcolorFn = function(n){
    		$scope.fontcolor = $scope.colors[n].val || "#000";;
    		// $scope.fontcolorname = $scope.colors[n].name;
    	}
    }
}));