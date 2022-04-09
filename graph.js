var map = new BMapGL.Map("container",{minzoom:8,maxzoom:14});
var point = new BMapGL.Point(113.429, 38.4275);
//初始的缩放等级可以调整一下
map.centerAndZoom(point, 8); 
//滚轮放缩只是方便调试，最后要去掉
map.enableScrollWheelZoom(true);
//以下4个值的内容均要调整
var lng_offset=0.05;//lng（经度）上的offset
var lat_offset=0.025//lat(纬度)上的offset
var lng_base=116.404//lng的基准值
var lat_base=39.915//lat的基准值

//图的长宽为LENGTH,点的总数为LENGTH**2=TOTAL
const LENGTH=120,TOTAL=14400;

//地点的类
function Place(idx,road_num,use,lng,lat)
{
    this.index=idx;//地点编号
    this.num=road_num;//路的数量
    this.road_list=[];//路的列表
    this.in_use=use;//是否使用该点,布尔值表示
    this.point=new BMapGL.Point(lng,lat);//point
    this.marker=new BMapGL.Marker(this.point);//marker
    this.add_road=function(road)//加路
    {
        //虽然卡一开始会卡一下，但完全加载好之后还能接受
        road.line=new BMapGL.Polyline([this.point,Complete_graph.place_list[road.index].point],{strokeColor:"black", strokeWeight:2, strokeOpacity:0.5});
        map.addOverlay(road.line);
        //road.line.hide();
        this.road_list.push(road);
        this.num++;   
    };
    //判断某index的road是否在road_list中,如果在则true,不再则false
    this.in_road=function (idx)
    {
        let flag=false;
        let i;
        for(i=0;i<this.num;i++)
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
    this.length;//路长，从后端获取
    //this.length=60;//如果后端弄不到的话，单位为km
    this.time;//通行时间，从后端获取
    this.line;//路的连线
    this.get_length=function(){}//获取路长
    this.get_time=function(){}//获取通行时间
}

//图的类
function Graph()
{
    this.place_num=0;//地点的数量，默认为0
    this.place_list=[];//地点的list
    this.init=function(ln_base,la_base,ln_offset,la_offset)
    {
        let i,j;//此处i,j分别相当于y,x
        for(i=0;i<LENGTH;i++)
        {
            for(j=0;j<LENGTH;j++)
            {
                //把新建立的Place根据index的顺序push到place_list
                this.place_list.push(new Place(xy2index(j,i),0,false,ln_base-ln_offset*(LENGTH-j-1), la_base-la_offset*i));
                this.place_num++;
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
                for(j=0;j<this.place_list[i].num;j++)
                {
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
            this.lace_list[i].marker.hide();
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
            this.lace_list[i].marker.show();
            for(j=0;j<this.place_list[i].road_list.length;j++)
            {
                this.place_list[i].road_list[j].line.show();
            }
        }
    }
    //最短路径
    this.shortest_path=function(source,destination)
    {

    }
    //最短时间
    this.shortest_time=function(source,destination)
    {

    }
}

//记录最大数量Place的图
var Complete_graph = new Graph();
//记录big_representative_graph(区域大小为30*30)的图
var Big_graph = new Graph();
//记录small_representative_graph(区域大小为15*15)的图
var Small_graph = new Graph();

//根据x,y计算index
function xy2index(x,y)
{
    return y*LENGTH+x;
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

//指定范围内的随机数生成 [min,max)
function randomcreator(min,max)
{
    return Math.floor(Math.random()*(max-min))+min;
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
                            Complete_graph.place_list[key].add_road(new Road(key-LENGTH));
                            Complete_graph.place_list[key-LENGTH].add_road(new Road(key));
                        }
                        next_key=key-LENGTH;//设置next_key
                        //还要判断是否已经纳入要显示的点，未纳入则纳入
                        if(!Complete_graph.place_list[key-LENGTH].in_use)
                        {
                            total_point++;
                            Complete_graph.place_list[key-LENGTH].in_use=true;
                            map.addOverlay(Complete_graph.place_list[key-LENGTH].marker);
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
                            Complete_graph.place_list[key].add_road(new Road(key+1));
                            Complete_graph.place_list[key+1].add_road(new Road(key));                           
                        }
                        next_key=key+1;//设置next_key
                        //还要判断是否已经纳入要显示的点，未纳入则纳入
                        if(!Complete_graph.place_list[key+1].in_use)
                        {
                            total_point++;
                            Complete_graph.place_list[key+1].in_use=true;
                            map.addOverlay(Complete_graph.place_list[key+1].marker);
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
                            Complete_graph.place_list[key].add_road(new Road(key+LENGTH));
                            Complete_graph.place_list[key+LENGTH].add_road(new Road(key));                         
                        }
                        next_key=key+LENGTH;//设置next_key
                        //还要判断是否已经纳入要显示的点，未纳入则纳入
                        if(!Complete_graph.place_list[key+LENGTH].in_use)
                        {
                            total_point++;
                            Complete_graph.place_list[key+LENGTH].in_use=true;
                            map.addOverlay(Complete_graph.place_list[key+LENGTH].marker);
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
                            Complete_graph.place_list[key].add_road(new Road(key-1));
                            Complete_graph.place_list[key-1].add_road(new Road(key));                          
                        }
                        next_key = key-1;//设置next_key
                        //还要判断是否已经纳入要显示的点，未纳入则纳入
                        if(!Complete_graph.place_list[key-1].in_use)
                        {
                            total_point++;
                            Complete_graph.place_list[key-1].in_use=true;
                            map.addOverlay(Complete_graph.place_list[key-1].marker);
                        }
                    }
                    break;
                // case 4://西北
                //     //检测是否超出范围，超出了范围就算了
                //     if(index2x(key)>0&&index2y(key)>0)
                //     {                  
                //         //判断是否已经在road_list之中,不在则连一条边，否则就算了
                //         if(!All_place.place_list[key].in_road(key,key-LENGTH-1)&&(!All_place.place_list[key-LENGTH-1].in_road(key)))
                //         {   //路是双向的
                //             All_place.place_list[key].add_road(new Road(key-LENGTH-1));
                //             All_place.place_list[key-LENGTH-1].add_road(new Road(key));                          
                //         }
                //         next_key = key-LENGTH-1;//设置next_key
                //         //还要判断是否已经纳入要显示的点，未纳入则纳入
                //         if(!All_place.place_list[key-LENGTH-1].in_use)
                //         {
                //             total_point++;
                //             All_place.place_list[key-LENGTH-1].in_use=true;
                //             map.addOverlay(All_place.place_list[key-LENGTH-1].marker);
                //         }
                //     }
                //     break;
                // case 5://东北
                //     //检测是否超出范围，超出了范围就算了
                //     if(index2x(key)<LENGTH-1&&index2y(key)>0)
                //     {                  
                //         //判断是否已经在road_list之中,不在则连一条边，否则就算了
                //         if(!All_place.place_list[key].in_road(key,key-LENGTH+1)&&(!All_place.place_list[key-LENGTH+1].in_road(key)))
                //         {   //路是双向的
                //             All_place.place_list[key].add_road(new Road(key-LENGTH+1));
                //             All_place.place_list[key-LENGTH+1].add_road(new Road(key));                          
                //         }
                //         next_key = key-LENGTH+1;//设置next_key
                //         //还要判断是否已经纳入要显示的点，未纳入则纳入
                //         if(!All_place.place_list[key-LENGTH+1].in_use)
                //         {
                //             total_point++;
                //             All_place.place_list[key-LENGTH+1].in_use=true;
                //             map.addOverlay(All_place.place_list[key-LENGTH+1].marker);
                //         }
                //     }
                //     break;
                // case 6://西南
                //     //检测是否超出范围，超出了范围就算了
                //     if(index2x(key)>0&&index2y(key)<LENGTH-1)
                //     {                  
                //         //判断是否已经在road_list之中,不在则连一条边，否则就算了
                //         if(!All_place.place_list[key].in_road(key,key+LENGTH-1)&&(!All_place.place_list[key+LENGTH-1].in_road(key)))
                //         {   //路是双向的
                //             All_place.place_list[key].add_road(new Road(key+LENGTH-1));
                //             All_place.place_list[key+LENGTH-1].add_road(new Road(key));                          
                //         }
                //         next_key = key+LENGTH-1;//设置next_key
                //         //还要判断是否已经纳入要显示的点，未纳入则纳入
                //         if(!All_place.place_list[key+LENGTH-1].in_use)
                //         {
                //             total_point++;
                //             All_place.place_list[key+LENGTH-1].in_use=true;
                //             map.addOverlay(All_place.place_list[key+LENGTH-1].marker);
                //         }
                //     }
                //     break;
                // case 7://东南
                //     //检测是否超出范围，超出了范围就算了
                //     if(index2x(key)<LENGTH-1&&index2y(key)<LENGTH-1)
                //     {                  
                //         //判断是否已经在road_list之中,不在则连一条边，否则就算了
                //         if(!All_place.place_list[key].in_road(key,key+LENGTH+1)&&(!All_place.place_list[key+LENGTH+1].in_road(key)))
                //         {   //路是双向的
                //             All_place.place_list[key].add_road(new Road(key+LENGTH+1));
                //             All_place.place_list[key+LENGTH+1].add_road(new Road(key));                          
                //         }
                //         next_key = key+LENGTH+1;//设置next_key
                //         //还要判断是否已经纳入要显示的点，未纳入则纳入
                //         if(!All_place.place_list[key+LENGTH+1].in_use)
                //         {
                //             total_point++;
                //             All_place.place_list[key+LENGTH+1].in_use=true;
                //             map.addOverlay(All_place.place_list[key+LENGTH+1].marker);
                //         }
                //     }
                //     break;
            }
        }
        //从连边上找到一个点作为新的key,最后一次连边的点作为新的key
        key=next_key;     
    }
}




//地图的显示(BFS周围100个点以及相关联的边)
//待测试
function map_show(x,y)
{
    source=xy2index(x,y);
    let queue = [];//先整个queue
    let list = [];//存放要显示的点
    let i,j;
    while(queue.length!=0||list.length<100)
    {
        //初始将起始节点加入显示列表list
        if(list.length==0)
        {
            queue.push(source);//push入队
            list.push(source);//加入显示列表
            Complete_graph.place_list[list[i]].marker.show();//显示标记点marker
        }
        //将与当前节点相邻，且不list中的节点push入queue
        for(i=0;i<Complete_graph.place_list[queue[0]].road_list.length;i++)
        {
            if(!Complete_graph.place_list[queue[0]].road_list.includes(list[j]))
            {
                queue.push(Complete_graph.place_list[queue[0]].road_list[i].index);//push入队
                list.push(Complete_graph.place_list[queue[0]].road_list[i].index);//加入显示列表
                map.addoverlay(Complete_graph.place_list[list[i]].marker);//添加标记点marker
                Complete_graph.place_list[list[i]].show_road(Complete_graph.place_list[queue[0]].road_list[i].index);//把这条路显示出来
            }
            else
                continue;
        }
        //移除位于队首的节点        
        queue.shift();
    }

}


//TIME1,TIME2,TIME3用于区分拥堵情况，不拥堵为绿色，有点拥堵为黄色，拥堵为红色
const TIME1=3600,TIME2=5400,TIME3=7200;
//路况图
//麻了，为什么这么多种红黄绿
function Traffic_graph()
{
    let i = 0;
    let j = 0;
    for(i=0;i<TOTAL;i++)
    {
        if(Complete_graph.place_list[i].in_use)
        {
            for(j=0;j<Complete_graph.place_list[i].num;j++)
            {
                //随机生成通行时间
                Complete_graph.place_list[i].road_list[j].time=randomcreator(3600,9001);
                

                if(Complete_graph.place_list[i].road_list[j].time>=TIME1&&Complete_graph.place_list[i].road_list[j].time<TIME2)//不拥堵
                {
                    Complete_graph.place_list[i].road_list[j].line.setStrokeColor("green");
                    Complete_graph.place_list[i].road_list[j].line.show();
                }
                else
                {
                    if(Complete_graph.place_list[i].road_list[j].time<TIME3&&Complete_graph.place_list[i].road_list[j].time>=TIME2)//有一点拥堵
                    {
                        Complete_graph.place_list[i].road_list[j].line.setStrokeColor("yellow");
                        Complete_graph.place_list[i].road_list[j].line.show();
                    }
                    else
                    {
                        if(Complete_graph.place_list[i].road_list[j].time>=TIME3)//拥堵
                        {
                            Complete_graph.place_list[i].road_list[j].line.setStrokeColor("red");
                            Complete_graph.place_list[i].road_list[j].line.show();
                        }
                        else//时间<=0，说明有问题
                        {
                            window.alert("时间生成的有问题");
                            return;
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
function build_big_representative_graph()
{
    
}


//对small_representative_list(15*15的区域)进行处理
function build_small_representative_graph()
{
    
}


//缩放功能,根据缩放等级进行处理8、9 ; 10、11 ; 12、13、14
//在进行根据坐标找点和最短路径时候不要让这个缩放控件出现，并且要在进行之前要调整一下缩放等级和覆盖物的显示情况
function change_scale(zoom_level)
{
    //8,9级仅显示区域的代表点,区域为30*30

    //10,11级仅显示区域内的代表点，区域为15*15

    //12，13，14级显示所有的点
}