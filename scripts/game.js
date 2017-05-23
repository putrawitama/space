/**=====================================================================================================================
||======================================================================================================================
||  !!KURANG:
||      1. Optimasi waktu random saat laserbeam ganti haluan
||      2. Game berhenti saat player terkena laserbeam
||======================================================================================================================
||======================================================================================================================
*/

/**=====================================================================================================================
||======================================================================================================================
||  1. DEKLARASI VARIABEL
||      a.) player : pemain
||      b.) lbH : laserbeam horizontal
||      c.) lbV : laserbeam vertical
||      d.) consumable : item berwarna biru
||      e.) manager : bagian memenejemen permainan (score dan level)
||      f.) gameArea : bertanggungjawab atas canvas dan update frame
||======================================================================================================================
||======================================================================================================================
*/
        var defaultPlayer = "#EEEEEE";
        var defaultLaser = "#E53935";
        var defaultItem = "#8BC34A";
        var audioIsPaused = false;
        

        var player;
        var lbH;
        var lbV;
        var consumable;
        var manager;
        var joystick;
        var support;
        var name;
        var touch1;
        var isPaused;
        var audio = new Audio('sounds/backsound.mp3');
        var gameArea = {
            // title : "spacelimit",
            canvas : document.createElement("canvas"),
            start : function(){
               isPaused = false;
               var w = window.innerWidth-2; // -2 accounts for the border
               var h = window.innerHeight-2;
               this.canvas.width = w;
               this.canvas.height = h;
               touch1 = TouchController(this.canvas);
               this.ui = document.getElementById("ui");
               this.inName = document.getElementById("playerName");
               this.ui.style.display = "none";
               this.cover = document.getElementById("cover");
               this.cover.style.display = "none";
               this.context = this.canvas.getContext("2d");
               document.body.insertBefore(this.ui, document.body.childNodes[0]);
               document.body.insertBefore(this.canvas, document.body.childNodes[1]);
               this.interval = setInterval(function(){
                 if (!isPaused) {
                   lbH.move();
                   lbV.move();
                   updateGameArea();
                 }
               }, 20);

               window.addEventListener('keydown', function (e) {
                    gameArea.keys = (gameArea.keys || []);
                    gameArea.keys[e.keyCode] = true;
                });
                window.addEventListener('keyup', function (e) {
                    gameArea.keys[e.keyCode] = false;
                });
            },
            clear : function(){
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                touch1.draw(this.context);
            },
            stop : function() {
                clearInterval(this.interval);
            }
        };

/**=====================================================================================================================
||======================================================================================================================
||  2. INSTANCE OBJEK YANG BERUPA FUNGSI DAN FUNGSI BIASA
||      a.) startGame : memulai permainan. dipanggil oleh element body pada HTML
||      b.) gameManager : instance manager
||      c.) playerComponent : instance player / pemain
||      d.) edgeCheck : cek player jika mencapai ujung canvas, kemudian teleportasi ke sisi lain canvas
||      e.) laserbeamComponent : instance lbH dan lbV
||      f.) consumableComponent : instance consumable
||======================================================================================================================
||======================================================================================================================
*/
        function startGame(){
            gameArea.canvas.style.display = "block";
            document.getElementById("pause").style.display="block";
            gameArea.start();
            gameArea.cover.style.display = "none";
            manager = new gameManager();
            player = new playerComponent(20, 20, defaultPlayer, 10, 120);
            lbH = new laserbeamComponent(gameArea.canvas.width, 5, defaultLaser, 0, 10, "horizontal");
            lbV = new laserbeamComponent(5, gameArea.canvas.height, defaultLaser, 70, 0, "vertical");
            consumable = new consumableComponent(10, 10, defaultItem, 100, 120);
            audio.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
            }, false);
            if(!audioIsPaused){audio.play();}else{audio.pause();}
            if (typeof(Storage) !== "undefined") {
                support = true;
            } else {
                // Sorry! No Web Storage support..
                window.alert("Maaf, Browser anda tidak support untuk menyimpan high score, Lanjutkan?");
                support = false;
            }
        }

        function gameManager(){
            // this.scoreElement = document.getElementById("scoreboard");
            // this.levelElement = document.getElementById("level");
            this.score = 0;
            this.level = 1;
            this.levelSpeed = 1;
            this.charLevelSpeed = 0;
            this.leveling = "not yet";
            this.update = function(){
                // this.scoreElement.innerHTML = "Score: "+this.score;
                // this.levelElement.innerHTML = "Level: "+this.level;
                if(this.score > 0 && this.score%5 == 0 && this.leveling == "not yet"){
                    this.levelUp();
                    this.leveling = "done";
                }else if(this.score%5 != 0 && this.leveling == "done"){this.leveling = "not yet";}
            }
            this.levelUp = function(){
                this.level += 1;
                this.charLevelSpeed += 1;
                if (lbH.speedY < 0) {
                    lbH.speedY *= -1;
                    lbH.speedY += this.levelSpeed;
                    lbH.speedY *= -1;
                }else{
                    lbH.speedY += this.levelSpeed;
                }
                if (lbV.speedX < 0) {
                    lbV.speedX *= -1;
                    lbV.speedX += this.levelSpeed;
                    lbV.speedX *= -1;
                }else{
                    lbV.speedX += this.levelSpeed;
                }
                //
                //
                console.log("charspeed = "+player.speedX+", "+player.speedY+". horz spd = "+lbH.speedY+", vert spd = "+lbV.speedX);
            };
        }

        function playerComponent(width, height, color, x, y){
            this.width = width;
            this.height = height;
            this.speedX = 0;
            this.speedY = 0;
            this.x = x;
            this.y = y;
            this.left = this.x;
            this.right = this.x + this.width;
            this.top = this.y;
            this.bottom = this.y + this.height;
            this.update = function(){
                ctx = gameArea.context;
                ctx.fillStyle = color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            };
            this.newPos = function() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.left = this.x;
                this.right = this.x + this.width;
                this.top = this.y;
                this.bottom = this.y + this.height;
            };
            this.controlCheck = function(){
                this.speedX = 0;
                this.speedY = 0;
                // if (touch1.on) {
                //   if (touch1.x < 0) {this.speedX = -(5 + manager.charLevelSpeed); } //left
                //   if (touch1.x > 0) {this.speedX = 5  + manager.charLevelSpeed; } //right
                //   if (touch1.y < 0) {this.speedY = -(5 + manager.charLevelSpeed); } //up
                //   if (touch1.y > 0) {this.speedY = 5 + manager.charLevelSpeed; } //down
                // }
                if (gameArea.keys && gameArea.keys[37] || touch1.x < 0) {this.speedX = -(5 + manager.charLevelSpeed); } //left
                if (gameArea.keys && gameArea.keys[39] || touch1.x > 0) {this.speedX = 5  + manager.charLevelSpeed; } //right
                if (gameArea.keys && gameArea.keys[38] || touch1.y < 0) {this.speedY = -(5 + manager.charLevelSpeed); } //up
                if (gameArea.keys && gameArea.keys[40] || touch1.y > 0) {this.speedY = 5 + manager.charLevelSpeed; } //down
                this.newPos();
                edgeCheck(this);
            };
        }

        function edgeCheck(object){
            if (object.x > gameArea.canvas.width) {object.x = 0;}
            if (object.right < 0) {object.x = gameArea.canvas.width;}
            if (object.y > gameArea.canvas.height) {object.y = 0;}
            if (object.bottom < 0) {object.y = gameArea.canvas.height;}
        }

        function laserbeamComponent(width, height, color, x, y, name){
            this.name = name;
            this.width = width;
            this.height = height;
            this.speedX = 2;
            this.speedY = 2;
            this.x = x;
            this.y = y;
            this.left = this.x;
            this.right = this.x + this.width;
            this.top = this.y;
            this.bottom = this.y + this.height;
            this.turnRate = Math.floor((Math.random()*20)+1)*1000;
            this.turnInterval = setInterval(function(){this.turn();}.bind(this), this.turnRate);

            this.update = function(){
                ctx = gameArea.context;
                ctx.fillStyle = color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            };
            this.move = function(){
                if(this.name === "horizontal"){
                    //this.speedY += manager.levelSpeed;
                    this.y += this.speedY;
                }else{
                    //this.speedX += manager.levelSpeed;
                    this.x += this.speedX;
                }
                this.left = this.x;
                this.right = this.x + this.width;
                this.top = this.y;
                this.bottom = this.y + this.height;
                edgeCheck(this);
            };
            this.turn = function(){
                this.generateRandom();
                this.speedX *= -1;
                this.speedY *= -1;
            };
            this.generateRandom = function(){
                this.turnRate = Math.floor((Math.random()*20)+1)*1000;
            };
            this.playerCollision = function(){
                if(this.name === "horizontal"){
                    if((this.top < player.bottom) && (this.top > player.top) ||
                        (this.bottom > player.top) && (this.bottom < player.bottom)){
                        gameArea.stop();
                        showGameOver(support);

                    }
                }else if(this.name === "vertical"){
                    if((this.left < player.right) && (this.left > player.left) ||
                        (this.right > player.left) && (this.right < player.right)){
                        gameArea.stop();
                        showGameOver(support);
                    }
                }
            };
        }

        function showScore()
        {
            ctx.font = "bold 20px Arial";
            ctx.fillStyle = "white";
            ctx.fillText("Score : "+manager.score, gameArea.canvas.width-100, 60);

        }

        function showLevel()
        {
            ctx.font = "bold 20px Arial";
            ctx.fillStyle = "white";
            ctx.fillText("Level : "+manager.level, gameArea.canvas.width-100, 30);

        }

        function pause() {
          if (isPaused) {
            audio.play();
            isPaused = false;
            document.getElementById("pauseBtn").classList.remove('fa-play');
            document.getElementById("pauseBtn").classList.add('fa-pause');
          } else {
            audio.pause();
            isPaused = true;
            document.getElementById("pauseBtn").classList.add('fa-play');
            document.getElementById("pauseBtn").classList.remove('fa-pause');
          }
        }

        function save() {

            if (typeof(Storage) !== "undefined") {
              if(localStorage.getItem("name") == null){
                var val = document.getElementById("playerName").value;
                localStorage.setItem("name", val);
                document.getElementById("playerName").style.display = "none";
                console.log('sukses masukinnya');
              }
            } else {
                // Sorry! No Web Storage support..
                window.alert("Maaf, Browser anda tidak support untuk menyimpan, Lanjutkan?");
                support = false;
            }
        }

        function showGameOver(support)
        {
            audio.pause();
            audio.currentTime = 0;
            gameArea.ui.style.display = "block";
            // ctx.font = "bold 40px Arial";
            // ctx.fillStyle = "white";
            // ctx.fillText("Game Over", (gameArea.canvas.width/2)-110, (gameArea.canvas.height/2)-70);
            // ctx.fillText("Your Score : "+manager.score, (gameArea.canvas.width/2)-125, (gameArea.canvas.height/2)-40);
            document.getElementById("score").innerHTML = manager.score;
            document.getElementById("level").innerHTML = manager.level;
            if (support) {
                // Code for localStorage/sessionStorage.
                var LastScore = localStorage.getItem("highScore");
                if(LastScore < manager.score){
                    localStorage.setItem("highScore", manager.score);
                    document.getElementById("high").innerHTML = manager.score;
                } else {
                  if(LastScore < 1){
                    document.getElementById("high").innerHTML = 0;
                  } else {
                    document.getElementById("high").innerHTML = LastScore;
                  }
                }
            }
            gameArea.canvas.style.display = "none";
            document.getElementById("pause").style.display="none";
        }

        function consumableComponent(width, height, color, x, y){
            this.name = name;
            this.width = width;
            this.height = height;
            this.x = x;
            this.y = y;
            this.left = this.x;
            this.right = this.x + this.width;
            this.top = this.y;
            this.bottom = this.y + this.height;

            this.update = function(){
                ctx = gameArea.context;
                ctx.fillStyle = color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            };
            this.playerCollision = function(){
                if(((this.top <= player.bottom) && (this.top >= player.top) &&
                    (this.bottom >= player.top) && (this.bottom <= player.bottom) &&
                    (this.left <= player.right) && (this.left >= player.left) &&
                    (this.right >= player.left) && (this.right <= player.right)) ||
                    ((this.top <= player.bottom) && (this.top >= player.top) &&
                    (this.left >= player.left) && (this.left <= player.right) &&
                    (this.right <= player.right) && (this.right >= player.left)) ||
                    ((this.right >= player.left) && (this.right <= player.right) &&
                    (this.top >= player.top) && (this.top <= player.bottom) &&
                    (this.bottom >= player.top) && (this.bottom <= player.bottom)) ||
                    ((this.bottom >= player.top) && (this.bottom <= player.bottom) &&
                    (this.right <= player.right) && (this.right >= player.left) &&
                    (this.left <= player.right) && (this.left >= player.left)) ||
                    ((this.left <= player.right) && (this.left >= player.left) &&
                    (this.top <= player.bottom) && (this.top >= player.top) &&
                    (this.bottom <= player.bottom) && (this.bottom >= player.top))){
                        //console.log("Kena makan!");
                        this.collisionHandler();
                    }
            };
            this.collisionHandler = function(){
                // move
                this.x = Math.floor(Math.random()*gameArea.canvas.width)+1;
                this.y = Math.floor(Math.random()*gameArea.canvas.height)+1;
                this.left = this.x;
                this.right = this.x + this.width;
                this.top = this.y;
                this.bottom = this.y + this.height;
                // add score
                manager.score += 1;
            };
        }

/**=====================================================================================================================
||======================================================================================================================
||  SETTINGS
||      - Ganti warna player
||      - Ganti warna laser
||      - Ganti warna item
||      - Turn on/off audio
||======================================================================================================================
||======================================================================================================================
*/        
        function changeColor(target, hex){
            var color;
            var tCaption;
            var caption = document.getElementById(target);

            switch(hex) {
                case "#E53935":
                    color = "Red";
                    break;
                case "#00ACC1":
                    color = "Blue";
                    break;
                case "#8BC34A":
                    color = "Green";
                    break;
                case "#EEEEEE":
                    color = "White";
                    break;
                case "#FFF176":
                    color = "Yellow";
                    break;
                case "#9575CD":
                    color = "Purple";
                    break;
                case "#616161":
                    color = "Dark";
                    break;
                case "#8D6E63":
                    color = "Brown";
                    break;
                case "#EC407A":
                    color = "Magenta";
                    break;
            }
            
            switch (target) {
                case "cplayer":
                    defaultPlayer = hex;
                    tCaption = "Player";
                    break;
                case "claser":
                    defaultLaser = hex;
                    tCaption = "Laserbeam";
                    break;
                case "citem":
                    defaultItem = hex;
                    tCaption = "Item";
                    break;
            }

            caption.innerHTML = tCaption+": "+color;
        }

        function toggleAudio(toggleSwitch){
            switch (toggleSwitch) {
                case "On":
                    audio.play();
                    audioIsPaused = false;
                    break;
                case "Off":
                    audio.pause();
                    audioIsPaused = true;
                    break;
            }
            
            document.getElementById('caudio').innerHTML = "Music: "+toggleSwitch;
        }

/**=====================================================================================================================
||======================================================================================================================
||  3. UPDATE GAME SETIAP 50 FRAME PER DETIK
||      a.) updateGameArea : update situasi permainan setiap frame
||======================================================================================================================
||======================================================================================================================
*/
        function updateGameArea(){
            gameArea.clear();

            player.controlCheck();
            lbH.playerCollision();
            lbV.playerCollision();
            consumable.playerCollision();

            player.update();
            lbH.update();
            lbV.update();
            consumable.update();
            manager.update();
            showScore();
            showLevel();
        }
