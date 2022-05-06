//发送图的功能
//将每一个Place的index和它的road的index发送到后端(也许要包含distance)
function send_to(graph)
{
    var i,j;
    //表示发送的数据
    var send_data = [];
    //表示图的一个Place,其中记录了它的road的index
    var Place_obj=[];
    //对要发送的数据进行处理
    for(i=0;i<14400;i++)
    {
        //对每个Place判断一次，如果in_use==true,则将这个Place及其road的index作为数据
        //如果in_use==false,则让其等于-1,代表这个点的in_use位为false
        Place_obj=[];
        if(graph.place_list[i].in_use)
        {
            for(j=0;j<graph.place_list[i].length;j++)
            {
                Place_obj.push(graph.place_list[i].road_list[j].index);
            }
            send_data.push(Place_obj);
        }
        else
        {
            Place_obj.push(-1);
            send_data.push(Place_obj);
        }
    }
    //将数据发送到后端
    axios({
        method: 'POST',
        url: "http://1.14.150.210:8080/road/file/save",
        data: {
            map:{send_data}
        }
    }).then((res)=>{
        console.log(res.data);
     })
     .catch(function(error){
        console.log(error)
    });
}


//获取图的功能
//从后端获取图的每一个Place的index和它的road的index(也许要包含road_num、sdistance)
//并根据接收到的图的信息修改complete_graph、big_graph和small_graph
function get_from(graph)
{
    
}