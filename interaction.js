//发送图的功能
//将每一个Place的index和它的road的index发送到后端(也许要包含distance)
//现在应该是没问题了
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
        //对每个Place判断一次，如果in_use==true,则将这个Place相连的road的index以及该边的长度作为数据
        //如果in_use==false,则让其等于-1,代表这个点的in_use位为false
        Place_obj=[];
        if(graph.place_list[i].in_use==true)
        {
            for(j=0;j<graph.place_list[i].road_list.length;j++)
            {
                Place_obj.push(graph.place_list[i].road_list[j].index);
                Place_obj.push(graph.place_list[i].road_list[j].distance);
            }
            send_data.push(Place_obj);
        }
        else
        {
            Place_obj.push(-1);
            send_data.push(Place_obj);
        }
    }
    
    //发送请求将图发送过去，发送成功之后发送请求获取文件名
    axios({
        method: 'POST',
        url: "http://1.14.150.210:8080/road/file/save",
        data: {
        map:{send_data}
        }
    }).then((res)=>{
        //测试用，判断是否发送成功
        //加一个窗口进行反馈,返回文件名
        window.alert("地图存储成功，文件名为："+res.data.data.file_name);
    })
     .catch(function(error){
        console.log(error)
    });
}

//获取文件名的列表
//请求获取文件名并展示
async function get_file_list()
{
    var file_list;
    await axios({
        method: 'GET',
        url:"http://1.14.150.210:8080/road/file/list",
    }).then((res) => {
        //console.log(res.data.data.file_list);
        file_list = res.data.data.file_list

    }).catch((error) => {
        console.log(error)
    });
    return file_list
}


//获取图的功能
//从后端获取图的每一个Place的index和它的road的index(也许要包含road_num、sdistance)
//并根据接收到的图的信息修改complete_graph、big_graph和small_graph
async function get_from(filename)
{
    var res = await axios({
        method: 'GET',
        url:"http://1.14.150.210:8080/road/file",
        params: {
        name: filename
        }
    });
    let i, j;
    var get_map = res.data.data.map.send_data;
    //根据申请到的内容生成图 
    for (i = 0; i < 14400; i++) {
        if (get_map[i][0] != -1) {
            map.addOverlay(Complete_graph.place_list[i].marker);
            Complete_graph.place_list[i].in_use = true;
            for (j = 0; j < get_map[i].length;) {
                let road = new Road(get_map[i][j]);
                road.distance = get_map[i][j + 1];
                Complete_graph.place_list[i].add_road(road, Complete_graph);
                j = j + 2;
            }
        }
        else {
            Complete_graph.place_list[i].in_use = false;
        }
    }
}