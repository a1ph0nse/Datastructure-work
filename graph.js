var map = new BMapGL.Map("container");
var point = new BMapGL.Point(116.404, 39.915);
map.centerAndZoom(point, 15); 
map.enableScrollWheelZoom(true);
//以下4个值的内容均要调整
var lng_offset=0.1;//lng（经度）上的offset
var lat_offset=0.1//lat(纬度)上的offset
var lng_base=116.404//lng的基准值
var lat_base=39.915//lat的基准值

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
        //如果一起加路的话就直接卡死了
        //road.line=new BMapGL.Polyline([this.point,Place_list[road.index].point],{strokeColor:"blue", strokeWeight:2, strokeOpacity:0.5});
        //map.addOverlay(road.line);
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
    this.time;//通行时间，从后端获取
    this.line;//路的连线
    this.get_length=function(){}//获取路长
    this.get_time=function(){}//获取通行时间
}

//最短路径
function shortest_path(source,destination)
{

}

//最短时间
function shortest_time(source,destination)
{

}

//根据x,y计算index
function xy2index(x,y)
{
    return y*110+x;
}

//根据index计算x坐标
function index2x(index)
{
    return index%110;
}

//根据index计算y坐标
function index2y(index)
{
    return parseInt(index(index-(index%110))/110,10);
}

//指定范围内的随机数生成 [min,max)
function randomcreater(min,max)
{
    return Math.floor(Math.random()*(max-min))+min;
}



//初始化图上的地点的位置信息（经纬度）
var Place_list=[];//记录Place的数组
function init_Places()
{
    let i,j;//此处i,j分别相当于y,x
    for(i=0;i<110;i++)
    {
        for(j=0;j<110;j++)
        {
            //把新建立的Place根据index的顺序push到Place_list
            Place_list.push(new Place(xy2index(j,i),0,false,lng_base-lng_offset*j, lat_base-lat_offset*i));
        }
    }
}

//路的连接，即图的生成,N为需要点的数量
function build_graph(N)
{
    //先在110*110=12100个点中随机选择一个点作为起始点
    //start_index=randomcreater(0,12100);
    //此处考虑使用一个变量指向当前选中的点的index
    let key=randomcreater(0,12100);
    Place_list[key].in_use=true;
    map.addOverlay(Place_list[key].marker)
    let next_key;//用于找到下一个key
    //暂时只考虑周围4个点
    let i=0;
    let road_num//随机生成产生路的数量[1,5)
    let direction;//定义方向：0代表北方，1代表东方,2代表南方，3代表西方
    let total_point=1;//总计的point的数量

    //测试得好像没有问题
    //逻辑上还可以有些改进，如：让确定生成几条边就是几条边，不会因为方向随机而造成多次走一条边
    while(total_point<N)
    {
        road_num=randomcreater(1,5);
        //对选中点key的周围几个点随机生成边，如果这个点没有纳入，则纳入
        for(i=0;i<road_num;i++)
        {
            //若点的数量到了指定个数
            if(total_point==N)
            {
                break;
            }
            direction=randomcreater(0,4);//随机生成方向
            //方向是随机生成的，所以可能多次都是往一个方向去
            switch(direction)
            {
                case 0://北方
                    //检测是否超出范围，超出了范围就算了
                    if(key-110>=0)
                    {                  
                        //判断是否已经在road_list之中,不在则连一条边，否则就算了
                        if((!Place_list[key].in_road(key-110))&&(!Place_list[key-110].in_road(key)))
                        {   //路是双向的
                            Place_list[key].add_road(new Road(key-110));
                            Place_list[key-110].add_road(new Road(key));
                        }
                        next_key=key-110;//设置next_key
                        //还要判断是否已经纳入要显示的点，未纳入则纳入
                        if(!Place_list[key-110].in_use)
                        {
                            total_point++;
                            Place_list[key-110].in_use=true;
                            map.addOverlay(Place_list[key-110].marker);
                        }
                    }
                    break;
                case 1://东方
                    //检测是否超出范围，超出了范围就算了
                    if(index2x(key)+1<110)
                    {                  
                        //判断是否已经在road_list之中,不在则连一条边，否则就算了
                        if(!Place_list[key].in_road(key,key+1)&&(!Place_list[key+1].in_road(key)))
                        {   //路是双向的
                            Place_list[key].add_road(new Road(key+1));
                            Place_list[key+1].add_road(new Road(key));                           
                        }
                        next_key=key+1;//设置next_key
                        //还要判断是否已经纳入要显示的点，未纳入则纳入
                        if(!Place_list[key+1].in_use)
                        {
                            total_point++;
                            Place_list[key+1].in_use=true;
                            map.addOverlay(Place_list[key+1].marker);
                        }
                    }
                    break;
                case 2://南方
                    //检测是否超出范围，超出了范围就算了
                    if(key+110<12100)
                    {                  
                        //判断是否已经在road_list之中,不在则连一条边，否则就算了
                        if(!Place_list[key].in_road(key,key+110)&&(!Place_list[key+110].in_road(key)))
                        {   //路是双向的
                            Place_list[key].add_road(new Road(key+110));
                            Place_list[key+110].add_road(new Road(key));                         
                        }
                        next_key=key+110;//设置next_key
                        //还要判断是否已经纳入要显示的点，未纳入则纳入
                        if(!Place_list[key+110].in_use)
                        {
                            total_point++;
                            Place_list[key+110].in_use=true;
                            map.addOverlay(Place_list[key+110].marker);
                        }
                    }
                    break;
                case 3://西方
                    //检测是否超出范围，超出了范围就算了
                    if(index2x(key)-1>=0)
                    {                  
                        //判断是否已经在road_list之中,不在则连一条边，否则就算了
                        if(!Place_list[key].in_road(key,key-1)&&(!Place_list[key-1].in_road(key)))
                        {   //路是双向的
                            Place_list[key].add_road(new Road(key-1));
                            Place_list[key-1].add_road(new Road(key));                          
                        }
                        next_key = key-1;//设置next_key
                        //还要判断是否已经纳入要显示的点，未纳入则纳入
                        if(!Place_list[key-1].in_use)
                        {
                            total_point++;
                            Place_list[key-1].in_use=true;
                            map.addOverlay(Place_list[key-1].marker);
                        }
                    }
                    break;
            }
        }
        //从连边上找到一个点作为新的key,最后一次连边的点作为新的key
        key=next_key;     
    }
}




//地图的显示(BFS周围100个点以及相关联的边)
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
            Place_list[list[i]].marker.show();//显示标记点marker
        }
        //将与当前节点相邻，且不list中的节点push入queue
        for(i=0;i<Place_list[queue[0]].road_list.length;i++)
        {
            if(!Place_list[queue[0]].road_list.includes(list[j]))
            {
                queue.push(Place_list[queue[0]].road_list[i].index);//push入队
                list.push(Place_list[queue[0]].road_list[i].index);//加入显示列表
                map.addoverlay(Place_list[list[i]].marker);//添加标记点marker
                Place_list[list[i]].show_road(Place_list[queue[0]].road_list[i].index);//把这条路显示出来
            }
            else
                continue;
        }
        //移除位于队首的节点        
        queue.shift();
    }
}

