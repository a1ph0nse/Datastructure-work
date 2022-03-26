## 任务列表（我不太记得了，大伙改一改看一看）
1. 随机生成点、最小生成树（改）生成路,以及图的存储（前）
2. 地图显示，最近100个点（广度优先）
3. 地图缩放，按照区块划分图，根据不同的比例决定一个区块中显示多少个点（前）
4. 基于路径的最短路径，申请路径长度，最短路径算法，画图（不标颜色）（后）
5. 基于时间的最短路径，申请时间，最短路径算法，画图（标注颜色）（后）
6. 模拟车流量，直接调用某度api（？）
7. 写入文件

## 实现方法
1. 随机生成图，以及图的管理
- 随机生成图
   1. 先生成一个X*X（>=10000）大小的图(暂设X=110)
   2. 在其中选择一个点作为生成图的起始点
   3. 在选中点的周围随机选择一个点，连接一条边，并即将其作为下一个选中点
   4. 选中点与周围随机个数的点连接边
   5. 重复iii、iv直至选取到N个点
   - 待考虑1：如何定义周围？是周围4个还是周围8个？（先试着4个？）
   - 待考虑2：第3第4步是否可以缩减成一步？即选择周围至少一个点连接边，并从中随机找一个点作为下一个选中点（先合并着试试）
     - 待考虑3：具体还没有开始写，点太多用递归调用很大概率会堆栈溢出，不递归的写法还要在写的时候想一下
- 图的管理
   - 如果只与周围4个或8个点相连接的话，邻接表还是最省空间的
   - 创建两个类place（点）和road（边），用数组把所有place依次连接起来，每个place后面接上相连接的road
   - place中包括在数组中的序号index，x,y坐标（向右为x的正方向，向下为y的正方向）（经度lng=x * lng_offset+lng_base,纬度lat=y * latoffset+lat_base）（实际上x,y坐标可以根据index计算出来x=index%X(边长);y=(index-x)/X(边长)，所以可以不用保存），连接road的数量，是否显示等
   - road中包含了place在数组中的序号index、路长、通行时间等

2. 地图显示，输入一个坐标，显示周围相邻的100个点和相联的边
- 将输入的点作为起始点，使用广度优先算法找出周围的100个点，显示出来，同时显示出遍历时经过的边

3. 地图缩放，按照区块划分图，根据不同的比例决定一个区块中显示多少个点
- 若每个区块的边长为N，则区号block_index=(y % N) * 4 + (x % N) * 1;
- 根据缩放等级的不同，决定一个区块中有多少个点会被显示

4. 基于路径的最短路径，申请路径长度，最短路径算法，画图（不标颜色）

...to be continued

## 任务分工
- wubaiwan:

- 2556553872@qq.com:

- a1ph0nse: