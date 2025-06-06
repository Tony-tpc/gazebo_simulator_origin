//------------------------------------
// 初始化连接
//------------------------------------
function init_socket() {
    window.socket = io();
    window.supplyStatus = 'disactive';
    socket.on('connect', function () {
        console.log('connect')
        // $('#red_hp_text').text(300)
        // $('#start_btn').removeAttr("disabled");
        $('#start_btn').text("请选择机器人");

    });
    socket.on('robot_names', function (message) {
        let robot_names = message.list
        let chosen_robot = message.chosen
        console.log(chosen_robot)
        $('#choose_robot_container').empty()
        window.robot_names = [...robot_names]
        for (let i = 0; i < robot_names.length; i++) {
            console.log(chosen_robot[robot_names[i]])
            console.log(robot_names[i],chosen_robot[robot_names[i]]===true)
            $('#choose_robot_container').append(`
            <div class="ch_box"  onclick="select_robot(this,'${robot_names[i]}',${chosen_robot[robot_names[i]]===undefined || chosen_robot[robot_names[i]]===false})">
            <img src="static/img/robot.jpg" class="ch_img">
            <span class="badge bg-${chosen_robot[robot_names[i]]===undefined || chosen_robot[robot_names[i]]===false?"success":"secondary"}">${chosen_robot[robot_names[i]]===undefined || chosen_robot[robot_names[i]]===false?"可选":"不可选"}</span>
            <h5 class="card-title">${robot_names[i]}</h5>
            </div>
            `)
        }

    });
    socket.on('disconnect', function () {
        console.log('disconnect')
    });

}

//------------------------------------
// 开始监听事件
//------------------------------------
function start_socket_transfer() {
    var start_time;
    var i = 0
    var ping_arr = []
    var my_camera = document.getElementById("camera")
    var hp_bar = $('#hp_bar')
    socket = window.socket
    socket.on('image', function (message) {
        i++
        my_camera.setAttribute('src', 'data:image/png;base64,' + message.img)
    });
    socket.on('hp', function (message) {
        console.log('hp', message.value)
        var hp = message.value
        // console.log(`${hp/5}%`)
        hp_bar.css("width", `${hp / 5}%`)
        // blue_bar.val(hp+'')
        $('#hp_text').text(hp + '')
    });
    socket.on('supply', function (message) {
        if (message.value === 'active') {
            $('#supplyModal').modal({
                backdrop: 'static',
                keyboard: false
            }).modal('show');
            window.supplyStatus = message.value;

            // 解绑鼠标
            document.exitPointerLock = document.exitPointerLock ||
                document.mozExitPointerLock ||
                document.webkitExitPointerLock;
            document.exitPointerLock();
            // 解除监听器
            document.removeEventListener("mousemove", mouseListener);
            $(document).unbind("mousedown");
	        $(document).unbind("mouseup");
        }
        else{
            window.supplyStatus = 'disactive';


        }
    });
    // socket.on('red_hp', function (message) {
    //     console.log('red_hp', message.value)
    //     var hp = message.value
    //     red_bar.css("width", `${hp / 5}%`)
    //     $('#red_hp_text').text(hp + '')
    // });
    window.fp_timer = setInterval(() => {
        start_time = (new Date).getTime();
        // console.log("帧率:" + i)
        $('#fps').text(i);
        i = 0
        socket.emit('ping');
    }, 1000)
    socket.on('pong', function () {
        // console.log('pong')
        var latency = (new Date).getTime() - start_time;
        ping_arr.push(latency);
        ping_arr = ping_arr.slice(-30);
        var sum = 0;
        for (var i = 0; i < ping_arr.length; i++)
            sum += ping_arr[i];
        ping = Math.round(10 * sum / ping_arr.length) / 10
        // console.log(ping)
        $('#ping').text(ping + 'ms');
    });
    window.cancelExchange = function() {
        $('#supplyModal').modal('hide');
        // 重新绑定鼠标
        elem.requestPointerLock = elem.requestPointerLock ||
        elem.mozRequestPointerLock ||
        elem.webkitRequestPointerLock;
        elem.requestPointerLock();
        // 开启鼠标监听
        document.addEventListener("mousemove", mouseListener);
        $(document).mousedown(function(e){
                if(1 == e.which){
                    // console.log("你点击了鼠标左键");
                    mouse_down_controller()
                }
                if (3 == e.which) {
                    // console.log("你点击了鼠标右键");
                    right_mouse_down_controller()
                }
            });
        $(document).mouseup(function(e){
                if(1 == e.which){
                    // console.log("你松开了了鼠标左键");
                    mouse_up_controller()
                }
                if (3 == e.which) {
                    // console.log("你点击了鼠标右键");
                    right_mouse_up_controller()
                }
            });
        console.log('cancel exchange');
    }
    window.exchangeAmmo = function() {
        var ammoAmount = document.getElementById("ammoAmount").value;
        // Close the modal
        $('#supplyModal').modal('hide');

        // turn into integer
        ammo_request = parseInt(ammoAmount);

        // Send the ammo amount through socket
        socket.emit('exchange', { ammo_request: ammo_request});
        // 重新绑定鼠标
        elem.requestPointerLock = elem.requestPointerLock ||
        elem.mozRequestPointerLock ||
        elem.webkitRequestPointerLock;
        elem.requestPointerLock();
        // 开启鼠标监听
        document.addEventListener("mousemove", mouseListener);
        $(document).mousedown(function(e){
                if(1 == e.which){
                    // console.log("你点击了鼠标左键");
                    mouse_down_controller()
                }
                if (3 == e.which) {
                    // console.log("你点击了鼠标右键");
                    right_mouse_down_controller()
                }
            });
        $(document).mouseup(function(e){
                if(1 == e.which){
                    // console.log("你松开了了鼠标左键");
                    mouse_up_controller()
                }
                if (3 == e.which) {
                    // console.log("你点击了鼠标右键");
                    right_mouse_up_controller()
                }
            });
        console.log('exchange amount', ammoAmount);
    }
    window.control_timer = setInterval(() => {
        socket.emit('control', active_map);
        // console.log(active_map)
    }, send_freq)

}

//------------------------------------
// 关闭连接
//------------------------------------
