var map = new BMapGL.Map("container",{minzoom:8,maxzoom:14});
var central_point = new BMapGL.Point(113.429, 38.4275);
//初始的缩放等级可以调整一下
map.centerAndZoom(central_point, 8); 
//滚轮放缩只是方便调试，最后要去掉
//map.enableScrollWheelZoom(true);
//以下4个值的内容均要调整
var lng_offset=0.05;//lng（经度）上的offset
var lat_offset=0.025//lat(纬度)上的offset
var lng_base=116.404//lng的基准值
var lat_base=39.915//lat的基准值

//图的长宽为LENGTH,点的总数为LENGTH**2=TOTAL,Big_graph的区域长为30，一行4个,small_representative_graph的区域长为15，一行8个
const LENGTH=120,TOTAL=14400,BLOCK_LENGTH1=4,BLOCK_LENGTH2=8;

//指定范围内的随机数生成 [min,max)
function randomcreator(min,max)
{
    return Math.floor(Math.random()*(max-min))+min;
}

//地点的类
function Place(idx,use,lng,lat)
{
    this.index=idx;//地点编号
    this.road_list=[];//路的列表
    this.in_use=use;//是否使用该点,布尔值表示
    this.point=new BMapGL.Point(lng,lat);//point
    this.marker=new BMapGL.Marker(this.point);//marker
    this.marker.index=idx;
    this.marker.addEventListener('onclick',function()
    {   
        //点击点后会在index框中显示其index
        if(document.getElementById("x").value=='')
        {
            document.getElementById("x").value=this.index.toString();
        }
        else
        {
            document.getElementById("y").value=this.index;
        }
        
        return this.index;
    });

    this.add_road=function(road,graph)//加路
    {
        //虽然卡一开始会卡一下，但完全加载好之后还能接受
        road.line=new BMapGL.Polyline([this.point,graph.place_list[road.index].point],{strokeColor:"black", strokeWeight:2, strokeOpacity:0.5});
        map.addOverlay(road.line);
        road.line.hide();
        this.road_list.push(road);   
    };
    //判断index为idx的road是否在该Place的road_list中,如果在则true,不在则false
    this.in_road=function (idx)
    {
        let flag=false;
        let i;
        for(i=0;i<this.road_list.length;i++)
        {
            if(this.road_list[i].index==idx)
            {
                return true;
            }
            else
            {
                continue;
            }
        }
        return flag;
    }
    //连出一条路,路的样式可以调整一下
    this.show_road=function(road_index)
    {
        this.line.show();
    }
}

//路的类
function Road(idx)
{
    this.index=idx;//地点编号
    this.distance=randomcreator(1,10);//路长随机生成
    //this.distance=60;//如果后端弄不到的话，单位为km
    this.time;//通行时间
    this.line;//路的连线
    this.get_length=function(){}//获取路长
    this.get_time=function(){}//获取通行时间
}

//图的类
function Graph()
{
    this.place_list=[];//地点的list
    //初始化函数，把place_list这个数组中每个place的基本信息弄好，road_list中的内容之后再说
    this.init=function(ln_base,la_base,ln_offset,la_offset,length)
    {
        let i,j;//此处i,j分别相当于y,x
        for(i=0;i<length;i++)
        {
            for(j=0;j<length;j++)
            {
                //把新建立的Place根据index的顺序push到place_list
                this.place_list.push(new Place(xy2index(j,i,length),false,ln_base-ln_offset*(length-j-1), la_base-la_offset*i));
            }
        }
    }
    //将边的颜色变回默认颜色
    this.default_color=function()
    {
        let i,j;
        for(i=0;i<TOTAL;i++)
        {
            if(this.place_list[i].in_use)
            {
                for(j=0;j<this.place_list[i].road_list.length;j++)
                {
                    this.place_list[i].marker.show();//因为到时候返回的时候，那些点会隐藏，所以在加一个显示（即使是覆盖了前面的也没所谓，速度不会慢）
                    this.place_list[i].road_list[j].line.setStrokeColor("black");
                    this.place_list[i].road_list[j].line.show();
                }
            }
            else
            {
                continue;
            }
        }
    }
    //隐藏所有的地点和路
    this.hide_all=function()
    {
        let i,j;
        for(i=0;i<this.place_list.length;i++)
        {
            this.place_list[i].marker.hide();
            for(j=0;j<this.place_list[i].road_list.length;j++)
            {
                this.place_list[i].road_list[j].line.hide();
            }
        }
    }
    //显示该图所有的地点和路
    this.show_all=function()
    {
        let i,j;
        for(i=0;i<this.place_list.length;i++)
        {
            if(this.place_list[i].in_use)
            {
                this.place_list[i].marker.show();
                for(j=0;j<this.place_list[i].road_list.length;j++)
                {
                    this.place_list[i].road_list[j].line.show();
                }
            }
        }
    }
}

//记录最大数量Place的图
var Complete_graph = new Graph();

//记录Big_graph(区域大小为30*30)的图
var Big_graph = new Graph();

//记录small_representative_graph(区域大小为15*15)的图
var Small_graph = new Graph();

//根据x,y计算index
function xy2index(x,y,length)
{
    return y*length+x;
}

//根据x,y计算block_index
function xy2block_index(x,y,block_length)
{
    return ((parseInt(y/block_length,10)*LENGTH)/block_length)+parseInt(x/block_length,10);
}

//根据index计算x坐标
function index2x(index)
{
    return index%LENGTH;
}

//根据index计算y坐标
function index2y(index)
{
    return parseInt((index-index2x(index))/LENGTH,10);
}

//路的连接，即图的生成,N为需要点的数量
function build_graph(N)
{
    //LENGTH*LENGTH=TOTAL个点中随机选择一个点作为起始点
    //start_index=randomcreater(0,TOTAL);
    //此处考虑使用一个变量指向当前选中的点的index
    let key=randomcreator(0,TOTAL);
    Complete_graph.place_list[key].in_use=true;
    map.addOverlay(Complete_graph.place_list[key].marker)
    Complete_graph.place_list[key].marker.hide();
    let next_key;//用于找到下一个key
    //暂时只考虑周围4个点
    let i=0;
    let road_num//随机生成产生路的数量[1,5)
    let direction;//定义方向：0代表北方，1代表东方,2代表南方，3代表西方,4代表西北，5代表东北，6代表西南，7代表东南
    //如果是在8个方向里面随机的话，等的时间会更久
    let total_point=1;//总计的point的数量

    //测试得好像没有问题
    while(total_point<N)
    {
        road_num=randomcreator(1,5);
        //对选中点key的周围几个点随机生成边，如果这个点没有纳入，则纳入
        for(i=0;i<road_num;i++)
        {
            //若点的数量到了指定个数
            if(total_point==N)
            {
                break;
            }
            direction=randomcreator(0,4);//随机生成方向
            //方向是随机生成的，所以可能多次都是往一个方向去
            switch(direction)
            {
                case 0://北方
                    //检测是否超出范围，超出了范围就算了
                    if(key-LENGTH>=0)
                    {                  
                        //判断是否已经在road_list之中,不在则连一条边，否则就算了
                        if((!Complete_graph.place_list[key].in_road(key-LENGTH))&&(!Complete_graph.place_list[key-LENGTH].in_road(key)))
                        {   //路是双向的
                            Complete_graph.place_list[key].add_road(new Road(key-LENGTH),Complete_graph);
                            Complete_graph.place_list[key-LENGTH].add_road(new Road(key),Complete_graph);
                        }
                        next_key=key-LENGTH;//设置next_key
                        //还要判断是否已经纳入要显示的点，未纳入则纳入
                        if(!Complete_graph.place_list[key-LENGTH].in_use)
                        {
                            total_point++;
                            Complete_graph.place_list[key-LENGTH].in_use=true;
                            map.addOverlay(Complete_graph.place_list[key-LENGTH].marker);
                            Complete_graph.place_list[key-LENGTH].marker.hide();
                        }
                    }
                    break;
                case 1://东方
                    //检测是否超出范围，超出了范围就算了
                    if(index2x(key)+1<LENGTH)
                    {                  
                        //判断是否已经在road_list之中,不在则连一条边，否则就算了
                        if(!Complete_graph.place_list[key].in_road(key,key+1)&&(!Complete_graph.place_list[key+1].in_road(key)))
                        {   //路是双向的
                            Complete_graph.place_list[key].add_road(new Road(key+1),Complete_graph);
                            Complete_graph.place_list[key+1].add_road(new Road(key),Complete_graph);                           
                        }
                        next_key=key+1;//设置next_key
                        //还要判断是否已经纳入要显示的点，未纳入则纳入
                        if(!Complete_graph.place_list[key+1].in_use)
                        {
                            total_point++;
                            Complete_graph.place_list[key+1].in_use=true;
                            map.addOverlay(Complete_graph.place_list[key+1].marker);
                            Complete_graph.place_list[key+1].marker.hide();
                        }
                    }
                    break;
                case 2://南方
                    //检测是否超出范围，超出了范围就算了
                    if(key+LENGTH<TOTAL)
                    {                  
                        //判断是否已经在road_list之中,不在则连一条边，否则就算了
                        if(!Complete_graph.place_list[key].in_road(key,key+LENGTH)&&(!Complete_graph.place_list[key+LENGTH].in_road(key)))
                        {   //路是双向的
                            Complete_graph.place_list[key].add_road(new Road(key+LENGTH),Complete_graph);
                            Complete_graph.place_list[key+LENGTH].add_road(new Road(key),Complete_graph);                         
                        }
                        next_key=key+LENGTH;//设置next_key
                        //还要判断是否已经纳入要显示的点，未纳入则纳入
                        if(!Complete_graph.place_list[key+LENGTH].in_use)
                        {
                            total_point++;
                            Complete_graph.place_list[key+LENGTH].in_use=true;
                            map.addOverlay(Complete_graph.place_list[key+LENGTH].marker);
                            Complete_graph.place_list[key+LENGTH].marker.hide();
                        }
                    }
                    break;
                case 3://西方
                    //检测是否超出范围，超出了范围就算了
                    if(index2x(key)-1>=0)
                    {                  
                        //判断是否已经在road_list之中,不在则连一条边，否则就算了
                        if(!Complete_graph.place_list[key].in_road(key,key-1)&&(!Complete_graph.place_list[key-1].in_road(key)))
                        {   //路是双向的
                            Complete_graph.place_list[key].add_road(new Road(key-1),Complete_graph);
                            Complete_graph.place_list[key-1].add_road(new Road(key),Complete_graph);                          
                        }
                        next_key = key-1;//设置next_key
                        //还要判断是否已经纳入要显示的点，未纳入则纳入
                        if(!Complete_graph.place_list[key-1].in_use)
                        {
                            total_point++;
                            Complete_graph.place_list[key-1].in_use=true;
                            map.addOverlay(Complete_graph.place_list[key-1].marker);
                            Complete_graph.place_list[key-1].marker.hide();
                        }
                    }
                    break;
            }
        }
        //从连边上找到一个点作为新的key,最后一次连边的点作为新的key
        key=next_key;     
    }
}


//路况图
//麻了，为什么这么多种红黄绿
function Traffic_graph()
{
    Big_graph.hide_all();
    Small_graph.hide_all();
    map.setZoom(12);
    let i = 0;
    let j = 0;
    for(i=0;i<TOTAL;i++)
    {
        if(Complete_graph.place_list[i].in_use)
        {
            Complete_graph.place_list[i].marker.show();
            for(j=0;j<Complete_graph.place_list[i].road_list.length;j++)
            {
                //随机生成通行时间,或许可以修改一下计算方法，虽然本质上都是纯随机
                //现在试试调整一下
                //首先规定路的容量v与其终点连接的路数有关和道路长度有关，time=c*distance*f(n/v) f(n/v)=1(n/v<=某数)或1+en/v(n/v>某数)
                //设置路的容量v=road_num*distance,通行车辆数量的范围为[0,288]
                //n/v >0.4即为较阻塞 >0.7即为阻塞
                var v=Complete_graph.place_list[Complete_graph.place_list[i].road_list[j].index].road_list.length*10*Complete_graph.place_list[i].road_list[j].distance;
                var n=randomcreator(0,289);
                if(n/v<=0.4)
                {
                    //不拥堵
                    Complete_graph.place_list[i].road_list[j].line.setStrokeColor("green");
                    Complete_graph.place_list[i].road_list[j].line.show();
                    Complete_graph.place_list[i].road_list[j].time=Complete_graph.place_list[i].road_list[j].distance*100;
                }
                else
                {
                    if(n/v<0.7)
                    {
                        //比较拥堵
                        Complete_graph.place_list[i].road_list[j].line.setStrokeColor("yellow");
                        Complete_graph.place_list[i].road_list[j].line.show();
                        Complete_graph.place_list[i].road_list[j].time=(Complete_graph.place_list[i].road_list[j].distance*100)*(1+0.5*n/v);
                    }
                    else
                    {
                        //拥堵
                        if(n/v<=1)
                        {
                            Complete_graph.place_list[i].road_list[j].line.setStrokeColor("red");
                            Complete_graph.place_list[i].road_list[j].line.show();
                            Complete_graph.place_list[i].road_list[j].time=(Complete_graph.place_list[i].road_list[j].distance*100)*(1+(n/v));
                        }
                        else
                        {
                            Complete_graph.place_list[i].road_list[j].line.setStrokeColor("red");
                            Complete_graph.place_list[i].road_list[j].line.show();
                            Complete_graph.place_list[i].road_list[j].time=(Complete_graph.place_list[i].road_list[j].distance*100)*2;
                        }    
                    }
                }
            }
        }
        else
        {
            continue;
        }
    }
}



//对big_representative_list(30*30的区域)进行处理
//根据Complete_graph将Big_graph的代表点连起来
function build_Big_graph()
{
    let i,j;
    //首先x坐标不变，y坐标改变，确定东西方向相邻的区域是否有路 
    for(i=29;i<=89;i+=30)
    {
        for(j=0;j<LENGTH;j++)
        {
            //这个坐标的Complete_graph中的Place有边,且这两个区域之间没有边
            //则为这两个区域连上一条边，并且设置in_use为true
            if(Complete_graph.place_list[xy2index(i,j,LENGTH)].in_road(xy2index(i+1,j,LENGTH))&&!Big_graph.place_list[xy2block_index(i,j,(LENGTH/BLOCK_LENGTH1))].in_road(xy2block_index(i+1,j,(LENGTH/BLOCK_LENGTH1))))
            {
                Big_graph.place_list[xy2block_index(i,j,(LENGTH/BLOCK_LENGTH1))].add_road(new Road(xy2block_index(i+1,j,(LENGTH/BLOCK_LENGTH1))),Big_graph);
                Big_graph.place_list[xy2block_index(i+1,j,(LENGTH/BLOCK_LENGTH1))].add_road(new Road(xy2block_index(i,j,(LENGTH/BLOCK_LENGTH1))),Big_graph);
                Big_graph.place_list[xy2block_index(i,j,(LENGTH/BLOCK_LENGTH1))].in_use=true;
                Big_graph.place_list[xy2block_index(i+1,j,(LENGTH/BLOCK_LENGTH1))].in_use=true;
                map.addOverlay(Big_graph.place_list[xy2block_index(i,j,(LENGTH/BLOCK_LENGTH1))].marker);
                map.addOverlay(Big_graph.place_list[xy2block_index(i+1,j,(LENGTH/BLOCK_LENGTH1))].marker);
                Big_graph.place_list[xy2block_index(i,j,(LENGTH/BLOCK_LENGTH1))].marker.hide();
                Big_graph.place_list[xy2block_index(i+1,j,(LENGTH/BLOCK_LENGTH1))].marker
            }
            else
                continue;
        }
    }
    //之后y坐标不变，x坐标改变，确定南北方向相邻的区域是否有路
    for(i=29;i<=89;i+=30)
    {
        for(j=0;j<LENGTH;j++)
        {
            //这个坐标的Complete_graph中的Place有边,且这两个区域之间没有边
            //则为这两个区域连上一条边，并且设置in_use为true
            if(Complete_graph.place_list[xy2index(j,i,LENGTH)].in_road(xy2index(j,i+1,LENGTH))&&!Big_graph.place_list[xy2block_index(j,i,(LENGTH/BLOCK_LENGTH1))].in_road(xy2block_index(j,i+1,(LENGTH/BLOCK_LENGTH1))))
            {
                Big_graph.place_list[xy2block_index(j,i,(LENGTH/BLOCK_LENGTH1))].add_road(new Road(xy2block_index(j,i+1,(LENGTH/BLOCK_LENGTH1))),Big_graph);
                Big_graph.place_list[xy2block_index(j,i+1,(LENGTH/BLOCK_LENGTH1))].add_road(new Road(xy2block_index(j,i,(LENGTH/BLOCK_LENGTH1))),Big_graph);
                Big_graph.place_list[xy2block_index(j,i,(LENGTH/BLOCK_LENGTH1))].in_use=true;
                Big_graph.place_list[xy2block_index(j,i+1,(LENGTH/BLOCK_LENGTH1))].in_use=true;
                map.addOverlay(Big_graph.place_list[xy2block_index(j,i,(LENGTH/BLOCK_LENGTH1))].marker);
                map.addOverlay(Big_graph.place_list[xy2block_index(j,i+1,(LENGTH/BLOCK_LENGTH1))].marker);
                Big_graph.place_list[xy2block_index(j,i,(LENGTH/BLOCK_LENGTH1))].marker.hide();
                Big_graph.place_list[xy2block_index(j,i+1,(LENGTH/BLOCK_LENGTH1))].marker.hide();
            }
            else
                continue;
        }
    }
}


//对small_representative_list(15*15的区域)进行处理
//根据Complete_graph将small_representative_graph的代表点连起来
function build_Small_graph()
{
    let i,j;
    //首先x坐标不变，y坐标改变，确定东西方向相邻的区域是否有路 
    for(i=14;i<=104;i+=15)
    {
        for(j=0;j<LENGTH;j++)
        {
            //这个坐标的Complete_graph中的Place有边,且这两个区域之间没有边
            //则为这两个区域连上一条边，并且设置in_use为true
            if(Complete_graph.place_list[xy2index(i,j,LENGTH)].in_road(xy2index(i+1,j,LENGTH))&&!Small_graph.place_list[xy2block_index(i,j,(LENGTH/BLOCK_LENGTH2))].in_road(xy2block_index(i+1,j,(LENGTH/BLOCK_LENGTH2))))
            {
                Small_graph.place_list[xy2block_index(i,j,(LENGTH/BLOCK_LENGTH2))].add_road(new Road(xy2block_index(i+1,j,(LENGTH/BLOCK_LENGTH2))),Small_graph);
                Small_graph.place_list[xy2block_index(i+1,j,(LENGTH/BLOCK_LENGTH2))].add_road(new Road(xy2block_index(i,j,(LENGTH/BLOCK_LENGTH2))),Small_graph);
                Small_graph.place_list[xy2block_index(i,j,(LENGTH/BLOCK_LENGTH2))].in_use=true;
                Small_graph.place_list[xy2block_index(i+1,j,(LENGTH/BLOCK_LENGTH2))].in_use=true;
                map.addOverlay(Small_graph.place_list[xy2block_index(i,j,(LENGTH/BLOCK_LENGTH2))].marker);
                map.addOverlay(Small_graph.place_list[xy2block_index(i+1,j,(LENGTH/BLOCK_LENGTH2))].marker);
                Small_graph.place_list[xy2block_index(i,j,(LENGTH/BLOCK_LENGTH2))].marker.hide();
                Small_graph.place_list[xy2block_index(i+1,j,(LENGTH/BLOCK_LENGTH2))].marker.hide();
            }
            else
                continue;
        }
    }
    //之后y坐标不变，x坐标改变，确定南北方向相邻的区域是否有路
    for(i=14;i<=104;i+=15)
    {
        for(j=0;j<LENGTH;j++)
        {
            //这个坐标的Complete_graph中的Place有边,且这两个区域之间没有边
            //则为这两个区域连上一条边，并且设置in_use为true
            if(Complete_graph.place_list[xy2index(j,i,LENGTH)].in_road(xy2index(j,i+1,LENGTH))&&!Small_graph.place_list[xy2block_index(j,i,(LENGTH/BLOCK_LENGTH2))].in_road(xy2block_index(j,i+1,(LENGTH/BLOCK_LENGTH2))))
            {
                Small_graph.place_list[xy2block_index(j,i,(LENGTH/BLOCK_LENGTH2))].add_road(new Road(xy2block_index(j,i+1,(LENGTH/BLOCK_LENGTH2))),Small_graph);
                Small_graph.place_list[xy2block_index(j,i+1,(LENGTH/BLOCK_LENGTH2))].add_road(new Road(xy2block_index(j,i,(LENGTH/BLOCK_LENGTH2))),Small_graph);
                Small_graph.place_list[xy2block_index(j,i,(LENGTH/BLOCK_LENGTH2))].in_use=true;
                Small_graph.place_list[xy2block_index(j,i+1,(LENGTH/BLOCK_LENGTH2))].in_use=true;
                map.addOverlay(Small_graph.place_list[xy2block_index(j,i,(LENGTH/BLOCK_LENGTH2))].marker);
                map.addOverlay(Small_graph.place_list[xy2block_index(j,i+1,(LENGTH/BLOCK_LENGTH2))].marker);
                Small_graph.place_list[xy2block_index(j,i,(LENGTH/BLOCK_LENGTH2))].marker.hide();
                Small_graph.place_list[xy2block_index(j,i+1,(LENGTH/BLOCK_LENGTH2))].marker.hide();
            }
            else
                continue;
        }
    }
}


//缩放功能,根据缩放等级进行处理8、9 ; 10、11 ; 12、13、14
//在进行根据坐标找点和最短路径时候不要让这个缩放控件出现，并且要在进行之前要调整一下缩放等级和覆盖物的显示情况
function change_graph_to_show(zoom_level)
{
    switch (zoom_level)
    {
        //8,9级仅显示区域的代表点,区域为30*30
        case 8:
            Complete_graph.hide_all();
            Small_graph.hide_all();
            Big_graph.show_all();
            break;
        case 9:
            Complete_graph.hide_all();
            Small_graph.hide_all();
            Big_graph.show_all();
            break;
        //10,11级仅显示区域内的代表点，区域为15*15
        case 10:
            Complete_graph.hide_all();
            Big_graph.hide_all();
            Small_graph.show_all();          
            break;
        case 11:
            Complete_graph.hide_all();
            Big_graph.hide_all();
            Small_graph.show_all();  
            break;
        //12，13，14级显示所有的点
        case 12:
            Big_graph.hide_all();
            Small_graph.hide_all();  
            Complete_graph.show_all();
            break;
        case 13:
            Big_graph.hide_all();
            Small_graph.hide_all();  
            Complete_graph.show_all();
            break;
        case 14:
            Big_graph.hide_all();
            Small_graph.hide_all();  
            Complete_graph.show_all();
            break;
        //除此之外就是有问题的
        default:
            window.alert("缩放等级出现了问题！")
            break;
    }    
}
