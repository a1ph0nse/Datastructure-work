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
function Place(idx,road_num,sw,lng,lat)
{
    this.index=idx;//地点编号
    this.num=road_num;//路的数量
    this.road_list=[];//路的列表
    this.show=sw;//是否显示该点,布尔值表示
    this.point=new BMapGL.Point(lng,lat);//point
    this.marker=new BMapGL.Marker(point);//marker
    this.add_road=function(road)//加路
    {
        this.road_list.push(road);
        num++;   
    };
    //连出一条路,路的样式可以调整一下
    this.show_road=function(road_index)
    {
        map.addoverlay(new BMapGL.Polyline([this.point,Place_list[road_index].point],{strokeColor:"blue", strokeWeight:2, strokeOpacity:0.5}));
    }
    //判断某index的road是否在road_list中,如果在则true,不再则false
    this.in_road(road_index)
    {
        let flag=false;
        let i;
        for(i=0;i<this.num;i++)
        {
            if(road_list[i].index==road_index)
            {
                return true;
            }
            else
            {
                continue;
            }
        }
    }

}

//路的类
function Road(idx)
{
    this.index=idx;//地点编号
    this.length;//路长，从后端获取
    this.time;//通行时间，从后端获取
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
            Place_list.push(Place(xy2index(j,i),0,false,lng_base-lng_offset*j, lat_base-lat_offset*i));
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
    //暂时只考虑周围4个点
    //定义一下方向：0代表北方，1代表东方,2代表南方，3代表西方
    let i=0;
    let road_num//随机生成产生路的数量[1,5)
    let direction;

    road_num=randomcreater(1,5);
    for(i=0;i<road_num;i++)
    {
        direction=randomcreater(0,4);//随机生成方向
        switch(direction)
        {
            case 0://北方
                //检测是否超出范围
                if(key-110>=0)
                {
                    //!!还要计>=10000个点,应该不用两个if来判断
                    //还要判断是否已经在road_list之中
                    //路是双向的
                    if(!Place_list[key].road_list.in_road(key-110))
                        Place_list[key].road_list.add_road(new Road(key-110));
                    
                    if(!Place_list[key-110].road_list.in_road(key))
                        Place_list[key-110].road_list.add_road(new Road(key));                    
                    break;
                }
                else
                {
                    //超出范围就算了
                    break;
                }
            case 1://东方
                //检测是否超出范围
                if(index2x(key)+1<110)
                {
                    //还要判断是否已经在road_list之中
                    if(!Place_list[key].road_list.in_road(key+1))
                        Place_list[key].road_list.add_road(new Road(key+1));
                    //路是双向的
                    if(!Place_list[key+1].road_list.in_road(key))
                        Place_list[key+1].road_list.add_road(new Road(key));                    
                    break;
                }
                else
                {
                    //超出范围就算了
                    break;
                }
            case 2://南方
                //检测是否超出范围
                if(key+110<12100)
                {
                    //还要判断是否已经在road_list之中
                    if(!Place_list[key].road_list.in_road(key+110))
                        Place_list[key].road_list.add_road(new Road(key+110));
                    //路是双向的
                    if(!Place_list[key+110].road_list.in_road(key))
                        Place_list[key+110].road_list.add_road(new Road(key));                    
                    break;
                }
                else
                {
                    //超出范围就算了
                    break;
                }
            case 3://西方
                //检测是否超出范围
                if(index2x(key)-1>=0)
                {
                    //还要判断是否已经在road_list之中
                    if(!Place_list[key].road_list.in_road(key-1))
                        Place_list[key].road_list.add_road(new Road(key-1));
                    //路是双向的
                    if(!Place_list[key-1].road_list.in_road(key))
                        Place_list[key-1].road_list.add_road(new Road(key));                    
                    break;
                }
                else
                {
                    //超出范围就算了
                    break;
                }
        }
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
            map.addoverlay(Place_list[list[i]].marker);//添加标记点marker
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






