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
        var player;
        var lbH;
        var lbV;
        var consumable;
        var manager;
        var gameArea = {
            // title : "spacelimit",
            canvas : document.createElement("canvas"),
            start : function(){
               var w = window.innerWidth-2; // -2 accounts for the border
               var h = window.innerHeight-2;
               this.canvas.width = w;
               this.canvas.height = h;
               this.context = this.canvas.getContext("2d");
              //  document.body.insertBefore(this.title, document.body.childNodes[0]);
               document.body.insertBefore(this.canvas, document.body.childNodes[1]);

               this.interval = setInterval(function(){
                   lbH.move();
                   lbV.move();
                   updateGameArea();
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
            gameArea.start();
            manager = new gameManager();
            player = new playerComponent(20, 20, "yellow", 10, 120);
            lbH = new laserbeamComponent(gameArea.canvas.width, 5, "red", 0, 10, "horizontal");
            lbV = new laserbeamComponent(5, gameArea.canvas.height, "red", 70, 0, "vertical");
            consumable = new consumableComponent(10, 10, "blue", 100, 120);
            

        }

        function gameManager(){
            // this.scoreElement = document.getElementById("scoreboard");
            // this.levelElement = document.getElementById("level");
            this.score = 0;
            this.level = 1;
            this.levelSpeed = 0;
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
                this.levelSpeed += 1;
                lbH.speedY += this.levelSpeed;
                lbV.speedX += this.levelSpeed;
                console.log("Level Up!!");
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
                if (gameArea.keys && gameArea.keys[37]) {this.speedX = -(5 + manager.levelSpeed); }
                if (gameArea.keys && gameArea.keys[39]) {this.speedX = 5  + manager.levelSpeed; }
                if (gameArea.keys && gameArea.keys[38]) {this.speedY = -(5 + manager.levelSpeed); }
                if (gameArea.keys && gameArea.keys[40]) {this.speedY = 5 + manager.levelSpeed; }
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
                    }
                }else if(this.name === "vertical"){
                    if((this.left < player.right) && (this.left > player.left) ||
                        (this.right > player.left) && (this.right < player.right)){
                        gameArea.stop();
                    }
                }
            };
        }

        function showScore()
        {
            ctx.font = "bold 20px Arial";
            ctx.fillText("Score : "+manager.score, (gameArea.canvas.width/2)-40, 30);

        }

        function showLevel()
        {
            ctx.font = "bold 20px Arial";
            ctx.fillText("Level : "+manager.level, 40, 30);

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
