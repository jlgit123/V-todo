(function(Vue) {  //表示依赖全局的Vue
	const STORAGE_KEY = 'tasks-vtodo'
	
  	 // 本地存储数据对象
	const taskStorage = {
		//fetch获取数据
		fetch:function(){
			return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')  //如果是空，返回数组
			// 解析JSON字符串，构造由字符串描述的JavaScript值或数组
		},
		//save保存数据
		save:function(tasks){
			localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
			//（对象或者数组）转换为一个 JSON 字符串
		}
	}

	//初始化任务 ES6 const 
	const tasks = [	];

	//注册全局指令
	//指令名不要加上v-, 在引用这个指令时才需要加上 v-
	Vue.directive('app-focus', {
		inserted (el, binding) {
			//聚集元素
			el.focus()
		}
	})

	var app = new Vue({
		el: "#todoapp",
		data: {
			title: "V-Todo",
			// tasks,//ES6中对象属性的简写 等价于tasks:tasks
			tasks: taskStorage.fetch(),  //从本地存储中获取
			currentTask: null, //代表点击的那个任务项
			filterStatus: 'all' //接收变化的状态值
		},

		//定义监听器
		watch: {
			// 当对象中的某个属性发生改变之后，默认情况下不会被监听到
			// 如果希望修改对象属性之后，被监听到

			// 深度监听，使用deep:true实现监听
			tasks:{
				deep:true, 
				handler: function(newTasks, oldTasks){
					//将数据保存到本地
					taskStorage.save(newTasks)
				}
			}

			
		},

		//自定义局部指令
		directives: {
			"todo-focus": {
				//注意指令名称--updateb表示点击后有事件变化和更新，所以不用inserted
				update(el, binding) {
					//只有双击的那个元素才会获取焦点
					if (binding.value) {
						el.focus();
					}
				}
			}
		},
		//定义计算属性
		computed: {
			//根据hash值改变触发的不同状态过滤数据
			filterTasks(){ //filterTasks:function(){}
				//当 filterStatus 状态发送变化时，则过滤出不同的数据
				//判断filterStatus状态值
				switch(this.filterStatus){
					case 'active':
						//过滤出未完成的数据 filter
						return this.tasks.filter(item => !item.completed)
						break
					case 'completed':
						//过滤出所有已完成的数据 filter
						return this.tasks.filter(item => item.completed)
						break
					default:
						//当上面都不满足，返回所有数据
						return this.tasks
				}
			},

			toggleAll: {
				//当任务列表中的状态发生改变时，就更新复选框的状态
				get() {
					//get:function(){}
					return this.remaining === 0;
				},
				//当复选框的状态更新之后，则将任务列表中的状态更新
				set(newStatus) {
					//set:fucntion(){}
					//1. 当点击 checkbox 复选框后状态变化后，就会触发该方法运行,
					// 迭代出数组每个元素,把当前状态值赋给每个元素的 completed
					this.tasks.forEach(item => {
						//ES6语法，它等价于function(item){}
						item.completed = newStatus;
					});
				}
			},

			//剩余未完成的任务数量
			remaining() {
				//remaining: function(){}
				// 数组filter函数过滤所有未完成的任务项
				// unTasks 用于接收过滤之后 未完成的任务项，它是一个数组
				const unTasks = this.tasks.filter(function(item) {
					return !item.completed;
				});
				return unTasks.length;
			}
		},

		//定义函数
		methods: {
			finishEdit(item, index, event) {
				//1. 获取当前输入框的值，需要使用/event
				const content = event.target.value.trim();
				//2. 判断输入框的值是否为空，如果为空，则进行删除任务项
				if (!content) {
					//如果为空，则进行删除任务项
					//复用了下面的函数进行任务项移除,需要使用/index
					this.removeTask(index);
					return
				}
				//3.如果不为空，将添加到原有的任务项中，其实是做一个更新
				item.content = content;
				//4.移除，.editing样式，退出编辑状态
				this.currentTask = null;
			},

			//取消编辑
			cancleEdit() {
				// 当this.currentTask值为空时，item === currentTask不成立，.editing样式失效
				this.currentTask = null;
			},

			//进入编辑状态
			toEdit(item) {
				console.log(item);
				//将点击的那个任务项item，赋值给currentTask，用于页面.editing样式生效
				this.currentTask = item;
			},

			//移除所有已完成任务项
			removeCompleted() {
				//过滤所有未完成的任务项，重新将整个数组（未完成任务项），赋值给tasks
				this.tasks = this.tasks.filter(item => !item.completed);

				/*等价于
				this.tasks.filter = ( item => {
					function(item){
						return !item.completed
					}
				 }) */
			},

			//移除任务项
			removeTask(index) {
				//移除索引为index的一条数据
				this.tasks.splice(index, 1);
			},

			//添加任务项
			addTask(event) {
				//ES6语法，它等价于addTask: function(){}
				// 1.获取文本框中的内容event.target.value
				const content = event.target.value.trim(); //trim去除空格
				// 2.判断数据是否为空，如果为空，什么都不做
				if (!content.length) {
					//0>false  !false>true
					return;
				}
				// 3.如果不为空，则添加到数组中
				const id = this.tasks.length + 1;
				this.tasks.push({
					id, //等价于 id:id
					content, //等价于content:content
					completed: false
				});
				// 4.清空文本输入框的内容
				event.target.value = "";
			}
		}
	});
	// 写在vue实例外面
	// 当路由hash值发生变化之后，会自动调用该函数
	window.onhashchange = function(){
		//#/active #/ #/
		// 1. 获取路由的hash值，当截取的hash值不为空时返回，为空则返回'all'
		var hash = window.location.hash.substr(2) || 'all' 
		// 2. 状态一旦改变，就会将hash值赋值给filterStatus
		//    定义一个计算属性filterItems来感知 filterStatus的变化，当它变化之后，来过滤出不同的数据
		app.filterStatus = hash
	}

	// 第一次访问页面时,调用一次让状态生效
	window.onhashchange()
})(Vue);
