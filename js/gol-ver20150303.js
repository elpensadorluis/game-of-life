/*jslint onevar: true, undef: false, nomen: true, eqeqeq: true, plusplus: false, bitwise: true, regexp: true, newcap: true, immed: true  */
/**                                                                                
                        .-----------------------.                               
                  `-----`                       `.----.                         
              `---.                                   `---.                     
           .--.                                           `---                  
        .--`                                                  --.               
 -/-. --.                                                       `-- `-::        
 yMMMMNhs/-                                                   ./oymMMMMN        
 odyNddmNMMNdo:                                           -+hNMMMNmdMhdy`       
 /`/d::::/+oydNNh+`                                    :yNNdys+/::::ss /`       
 / m+::::::::::yMMMh/                               -yNMMd:::::::::::N.:`       
 /.M::::::::::oMMMMMMNo`                         `+mMMMMMMy::::::::::d+/        
 /-M::::::::::sMMMMMMMMMs.                     `+NMMMMMMMMd::::::::::m+/        
 `/No::::::::::dMMMMMMMNsyo`                  /hoNMMMMMMMm/:::::::::/M+-        
  /sm:::::::::::+ydmmhs/::/y:               .y+:::ohdmdho:::::::::::hd/         
   +dd::::::::::::::::::::::oo`            /s::::::::::::::::::::::yN+`         
   ./hm+:::::::::::::::::::::/s.    -     o+:::::::::::::::::::::/hm/-          
    .:+Nh/:::::::::::::::::::::h.  `m.   y/::::::::::::::::::::/sNs--           
     .:`omdo/:::::::::::::::+yy:   yMd`  .syo::::::::::::::::ohNs.--            
      `/` :sdmhso+////++syhy+.   `yMMMd.   `/shyso+////+osydmy/` :.             
        --   `-/+ssyyso+:.      /NMMMMMNo      `:/osyyyso/-`   -:               
         `:-                    .mMMMMMN:                    .:`                
           `:-                   .mMMMN-                   .:.                  
              --.                 -MMM/                 `--`                    
                `--.               oMh               .-/:.    
                   `----`          `M-           .---`  Luis Echenique 20150303
                        .------.``  y   `.------.                          -    
                                `...-...``*/                                      

(function () {

  var GOL = {

    columns : 0,
    rows : 0,
  
    waitTime: 0,
    generation : 0,

    running : false,
    autoplay : false,


    // Limpia el Estado
    clear : {
      schedule : false
    },


    // Average de los tiempo de ejecución
    times : {
      algorithm : 0,
      gui : 0
    },


    // Elementos
    element : {
      generation : null,
      steptime : null,
      livecells : null,
      hint : null,
      messages : {
        layout : null
      }
    },

    // Estado Inicial de la matriz
    initialState : '[{"39":[110]},{"40":[112]},{"41":[109,110,113,114,115]}]',

    // Rastro que deja la celda al morir
    trail : {
      current: true,
      schedule : false
    },


    // Estilo del Grid
    grid : {
      current : 0,

      schemes : [
      {
        color : '#3F3839'
      },

      {
        color : '#FFFFFF'
      },

      {
        color : '#666666'
      },

      {
        color : '' // Caso especial: 0px grid
      }
      ]
    },


    // Niveles de Zoom
    zoom : {
      current : 0,
      schedule : false,

      schemes : [
      // Ejemplo de proporción  { columns : 120, rows : 48, cellSize : 8 },
      {
        columns : 870,
        rows : 226,
        cellSize : 1
      },

      {
        columns :440,
        rows : 113,
        cellSize : 2
      },
      {
        columns :220,
        rows : 56,
        cellSize : 4
      },

      {
        columns : 120,
        rows : 23,
        cellSize : 8
      }
      ]
    },


    // Colores de las Celdas
    colors : {
      current : 0,
      schedule : false,

      schemes : [
      {
        dead : '#000000',
        trail : ['#006600'],
        alive : ['#FFFFCC', '#FFFF99', '#FFFF66', '#FFFF33', '#FFFF00', '#FFCC00', '#FF6633', '#FF6600', '#FF6633', '#FFCC00', '#FFFF00', '#FFFF33', '#FFFF66', '#FFFF99', '#FFFFCC']
      },

      {
        dead : '#FFFFFF',
        trail : ['#FFFF66'], 
        alive : ['#CCFFCC', '#99FF99', '#66FF66', '#00FF00', '#00CC00', '#009900', '#006600', '#003300', '#006600', '#009900', '#00CC00', '#00FF00', '#66FF66', '#99FF99', '#CCFFCC']
      },

      {
        dead : '#FFFFFF',
        trail : ['#99FF99'],
        alive : ['#8585FF', '#7272FF', '#5F5FFF', '#4C4CFF', '#3939FF', '#2626FF', '#1313FF', '#0000FF', '#1313FF', '#2626FF', '#3939FF', '#4C4CFF', '#5F5FFF', '#7272FF', '#8585FF']
      }

      ]
    },


    /**
         * Cuando carga el evento
         */
    init : function() {
      try {
        this.listLife.init();   // Inicia y reinicia el algoritmo
        this.loadConfig();      // carga la configuración desde la URL (autoplay, colors, zoom, ...)
        this.loadState();       // Carga el estado desde la URL
        this.keepDOMElements(); // Mantiene las referencias en el DOM (getElementsById)
        this.canvas.init();     // Inicia canvas GUI
        this.registerEvents();  // Maneja los registro de evento
    
        this.prepare();
      } catch (e) {
        alert("Error: "+e);
      }
    },


    /**
         * Carga la configuración desde el url
         */
    loadConfig : function() {
      var colors, grid, zoom;

      this.autoplay = this.helpers.getUrlParameter('autoplay') === '1' ? true : this.autoplay;
      this.trail.current = this.helpers.getUrlParameter('trail') === '1' ? true : this.trail.current;

      // Configuración Inicial del Color
      colors = parseInt(this.helpers.getUrlParameter('colors'), 10);
      if (isNaN(colors) || colors < 1 || colors > GOL.colors.schemes.length) {
        colors = 1;
      }

      // Configuración Inicial del Grid
      grid = parseInt(this.helpers.getUrlParameter('grid'), 10);
      if (isNaN(grid) || grid < 1 || grid > GOL.grid.schemes.length) {
        grid = 1;
      }

      // Configuración Inicial del Zoom
      zoom = parseInt(this.helpers.getUrlParameter('zoom'), 10);
      if (isNaN(zoom) || zoom < 1 || zoom > GOL.zoom.schemes.length) {
        zoom = 1;
      }

      this.colors.current = colors - 1;
      this.grid.current = grid - 1;
      this.zoom.current = zoom - 1;

      this.rows = this.zoom.schemes[this.zoom.current].rows;
      this.columns = this.zoom.schemes[this.zoom.current].columns;
    },


    /**
         * Carga el estado del Mundo desde el Url
         */
    loadState : function() {
      var state, i, j, y, s = this.helpers.getUrlParameter('s');

      if ( s === 'random') {
        this.randomState();
      } else {
        if (s == undefined) {
          s = this.initialState;
          this.randomState();
          
        }

        state = jsonParse(decodeURI(s));
          
        for (i = 0; i < state.length; i++) {
          for (y in state[i]) {
            for (j = 0 ; j < state[i][y].length ; j++) {
              this.listLife.addCell(state[i][y][j], parseInt(y, 10), this.listLife.actualState);
            }
          }
        }
      }
    },


    /**
     * Crea una distribución aleatoria
     */
    randomState : function() {
      var i, liveCells = (this.rows * this.columns) * 0.12;
      
      for (i = 0; i < liveCells; i++) {
        this.listLife.addCell(this.helpers.random(0, this.columns - 1), this.helpers.random(0, this.rows - 1), this.listLife.actualState);
      }

      this.listLife.nextGeneration();
    },


    /**
     * Limpia el estado actual y prepara una nueva ejecución 
     */
    cleanUp : function() {
      this.listLife.init(); // Algoritmo de inicio y reinicio
      this.prepare();
    },


    /**
     * Prepara los elementos y al canvas para una nueva ejecución
     */
    prepare : function() {
      this.generation = this.times.algorithm = this.times.gui = 0;
      this.mouseDown = this.clear.schedule = false;

      this.element.generation.innerHTML = '0';
      this.element.livecells.innerHTML = '0';
      this.element.steptime.innerHTML = '0.0000';

      this.canvas.clearWorld(); // Reinicia el canvasReset GUI
      this.canvas.drawWorld(); // Dibuja el estado actual

      if (this.autoplay) { // Proxima ejecución
        this.autoplay = false;
        this.handlers.buttons.run();
      }
    },


    /**
     * Mantiene los Elementos
     * Guarda las referencias de los elementos para esta sesión 
     */
    keepDOMElements : function() {
      this.element.generation = document.getElementById('generation');
      this.element.steptime = document.getElementById('steptime');
      this.element.livecells = document.getElementById('livecells');
      this.element.messages.layout = document.getElementById('layoutMessages');
      this.element.hint = document.getElementById('hint');
    },


    /**
     * Registro de Eventos
     * Registro de eventos para esta sesión
     */
    registerEvents : function() {

      // Eventos del Teclado
      this.helpers.registerEvent(document.body, 'keyup', this.handlers.keyboard, false);

      // Controles
      this.helpers.registerEvent(document.getElementById('buttonRun'), 'click', this.handlers.buttons.run, false);
      this.helpers.registerEvent(document.getElementById('buttonStep'), 'click', this.handlers.buttons.step, false);
      this.helpers.registerEvent(document.getElementById('buttonClear'), 'click', this.handlers.buttons.clear, false);
      //this.helpers.registerEvent(document.getElementById('buttonExport'), 'click', this.handlers.buttons.export_, false);

      // Distribución
      this.helpers.registerEvent(document.getElementById('buttonTrail'), 'click', this.handlers.buttons.trail, false);
      this.helpers.registerEvent(document.getElementById('buttonGrid'), 'click', this.handlers.buttons.grid, false);
      this.helpers.registerEvent(document.getElementById('buttonZoom'), 'click', this.handlers.buttons.zoom, false);
      this.helpers.registerEvent(document.getElementById('buttonColors'), 'click', this.handlers.buttons.colors, false);
    },


    /**
     * El siguiente paso
     */
    nextStep : function() {
      var i, x, y, r, liveCellNumber, algorithmTime, guiTime;

      // Ejecutar algoritmo
    
      algorithmTime = (new Date());

      liveCellNumber = this.listLife.nextGeneration();

      algorithmTime = (new Date()) - algorithmTime;


      // Ejecutar el canvas

      guiTime = (new Date());

      for (i = 0; i < this.listLife.redrawList.length; i++) {
        x = this.listLife.redrawList[i][0];
        y = this.listLife.redrawList[i][1];

        if (this.listLife.redrawList[i][2] === 1) {
          this.canvas.changeCelltoAlive(x, y);
        } else if (this.listLife.redrawList[i][2] === 2) {
          this.canvas.keepCellAlive(x, y);
        } else {
          this.canvas.changeCelltoDead(x, y);
        }
      }

      guiTime = (new Date()) - guiTime;

      // Actualización post-ejecución

      // Limpia el  Trail
      if (this.trail.schedule) {
        this.trail.schedule = false;
        this.canvas.drawWorld();
      }

      // Cambia el  Grid
      if (this.grid.schedule) {
        this.grid.schedule = false;
        this.canvas.drawWorld();
      }
        
       // Cambia el  Zoom
      if (this.zoom.schedule) {
        this.zoom.schedule = false;
        this.canvas.drawWorld();
      }

      // cambia el  Colors
      if (this.colors.schedule) {
        this.colors.schedule = false;
        this.canvas.drawWorld();
      }

      // Ejecuta la información
      this.generation++;
      this.element.generation.innerHTML = this.generation;
      this.element.livecells.innerHTML = liveCellNumber;

      r = 1.0/this.generation;
      this.times.algorithm = (this.times.algorithm * (1 - r)) + (algorithmTime * r);
      this.times.gui = (this.times.gui * (1 - r)) + (guiTime * r);
      this.element.steptime.innerHTML = parseFloat((algorithmTime  / guiTime) * (Math.round(this.times.algorithm) / Math.round(this.times.gui))).toFixed(4);

      // Flujo de control 
      if (this.running) {
        setTimeout(function() {
          GOL.nextStep();
        }, this.waitTime);
      } else {
        if (this.clear.schedule) {
          this.cleanUp();
        }
      }
    },


    /** ****************************************************************************************************************************
     * Evento Handerls
     */
    handlers : {

      mouseDown : false,
      lastX : 0,
      lastY : 0,


      /**
       *
       */
      canvasMouseDown : function(event) {
        var position = GOL.helpers.mousePosition(event);
        GOL.canvas.switchCell(position[0], position[1]);
        GOL.handlers.lastX = position[0];
        GOL.handlers.lastY = position[1];
        GOL.handlers.mouseDown = true;
      },


      /**
       *
       */
      canvasMouseUp : function() {
        GOL.handlers.mouseDown = false;
      },


      /**
       *
       */
      canvasMouseMove : function(event) {
        if (GOL.handlers.mouseDown) {
          var position = GOL.helpers.mousePosition(event);
          if ((position[0] !== GOL.handlers.lastX) || (position[1] !== GOL.handlers.lastY)) {
            GOL.canvas.switchCell(position[0], position[1]);
            GOL.handlers.lastX = position[0];
            GOL.handlers.lastY = position[1];
          }
        }
      },


      /**
       *
       */
      keyboard : function(e) {
        var event = e;
        if (!event) {
          event = window.event;
        }
      
        if (event.keyCode === 67) { // tecla: C
          GOL.handlers.buttons.clear();
        } else if (event.keyCode === 82 ) { // tecla: R
          GOL.handlers.buttons.run();
        } else if (event.keyCode === 83 ) { // tecla: S
          GOL.handlers.buttons.step();
        }
      },


      buttons : {
      
        /**
         * Botones de control - Play
         */
        run : function() {
          GOL.element.hint.style.display = 'none';

          GOL.running = !GOL.running;
          if (GOL.running) {
            GOL.nextStep();
            document.getElementById('buttonRun').value = 'Detener';
          } else {
            document.getElementById('buttonRun').value = 'Iniciar';
          }
        },


        /**
         * Botones de control - Siguiente paso - solo un paso a la vez
         */
        step : function() {
          if (!GOL.running) {
            GOL.nextStep();
          }
        },


        /**
         * Botones de control - Limpiar Mundo
         */
        clear : function() {
          if (GOL.running) {
            GOL.clear.schedule = true;
            GOL.running = false;
            document.getElementById('buttonRun').value = 'Run';
          } else {
            GOL.cleanUp();
          }
        },


        /**
         * Botones de Control - Activar y desactivar rastro 
         */
        trail : function() {
          GOL.element.messages.layout.innerHTML = GOL.trail.current ? 'Sin Rastro' : 'Con Rastro';
          GOL.trail.current = !GOL.trail.current;
          if (GOL.running) {
            GOL.trail.schedule = true;
          } else {
            GOL.canvas.drawWorld();
          }
        },


        /**
         *
         */
        colors : function() {
          GOL.colors.current = (GOL.colors.current + 1) % GOL.colors.schemes.length;
          GOL.element.messages.layout.innerHTML = 'Esquema de Color Nº' + (GOL.colors.current + 1);
          if (GOL.running) {
            GOL.colors.schedule = true; 
          } else {
            GOL.canvas.drawWorld(); 
          }
        },


        /**
         *
         */
        grid : function() {
          GOL.grid.current = (GOL.grid.current + 1) % GOL.grid.schemes.length;
          GOL.element.messages.layout.innerHTML = 'Tipo de Grid  Nº' + (GOL.grid.current + 1);
          if (GOL.running) {
            GOL.grid.schedule = true; 
          } else {
            GOL.canvas.drawWorld(); 
          }
        },
          
        zoom : function() {
          GOL.zoom.current = (GOL.zoom.current + 1) % GOL.zoom.schemes.length;
          GOL.element.messages.layout.innerHTML = 'Zoom x' + (GOL.zoom.schemes[GOL.zoom.current].cellSize);
          if (GOL.running) {
            GOL.zoom.schedule = true; 
          } else {
            GOL.canvas.drawWorld(); 
          }
        },


        
      }
    
    },


    /** ****************************************************************************************************************************
     *
     */
    canvas: {

      context : null,
      width : null,
      height : null,
      age : null,
      cellSize : null,
      cellSpace : null,


      /**
       * init
       */
      init : function() {

        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');

        this.cellSize = GOL.zoom.schemes[GOL.zoom.current].cellSize;
        this.cellSpace = 1;

        GOL.helpers.registerEvent(this.canvas, 'mousedown', GOL.handlers.canvasMouseDown, false);
        GOL.helpers.registerEvent(document, 'mouseup', GOL.handlers.canvasMouseUp, false);
        GOL.helpers.registerEvent(this.canvas, 'mousemove', GOL.handlers.canvasMouseMove, false);

        this.clearWorld();
      },


      /**
       * Limpia el mundo
       */
      clearWorld : function () {
        var i, j;

        // Inicia la era (referencia del Canvas)
        this.age = [];
        for (i = 0; i < GOL.columns; i++) {
          this.age[i] = [];
          for (j = 0; j < GOL.rows; j++) {
            this.age[i][j] = 0; // Dead
          }
        }
      },


      /**
       * dibuja el mundo
       */
      drawWorld : function() {
        var i, j;

        // Caso especial: Sin Grid
        if (GOL.grid.schemes[GOL.grid.current].color === '') {
          this.setNoGridOn();
          this.width = this.height = 0;
        } else {
          this.setNoGridOff();
          this.width = this.height = 1;
        }

        /*/ Canvas Dinamico: pensando en hacer que el canvas cambie de tamaño cuando se cambie de zoom
        this.width = this.width + (this.cellSpace * GOL.columns) + (this.cellSize * GOL.columns);
        this.canvas.setAttribute('width', this.width);

        this.height = this.height + (this.cellSpace * GOL.rows) + (this.cellSize * GOL.rows);
        this.canvas.getAttribute('height', this.height);
        */
          
        
        // Hace que el Grid sea Dinamico manteniendo el tamaño del canvas  
        this.width = (this.cellSpace * GOL.columns);
        this.canvas.setAttribute('width', this.width);

        this.height = (this.cellSpace * GOL.rows) + (this.cellSize * GOL.rows);
        this.canvas.getAttribute('height', this.height);
          

        // Rellena el Fondo
        this.context.fillStyle = GOL.grid.schemes[GOL.grid.current].color;
        this.context.fillRect(0, 0, this.width, this.height);

        for (i = 0 ; i < GOL.columns; i++) {
          for (j = 0 ; j < GOL.rows; j++) {
            if (GOL.listLife.isAlive(i, j)) {
              this.drawCell(i, j, true);
            } else {
              this.drawCell(i, j, false);
            }
          }
        }
      },


      /**
       * Caso especial: con grid
       */
      setNoGridOn : function() {
        this.cellSize = GOL.zoom.schemes[GOL.zoom.current].cellSize + 1;
        this.cellSpace = 1;
      },


      /**
       * Caso especial: Sin Grid
       */
      setNoGridOff : function() {
        this.cellSize = GOL.zoom.schemes[GOL.zoom.current].cellSize;
        this.cellSpace = 1;
      },


      /**
       * Dibuja la celda
       */
      drawCell : function (i, j, alive) {
                
        if (alive) {

          if (this.age[i][j] > -1)
            this.context.fillStyle = GOL.colors.schemes[GOL.colors.current].alive[this.age[i][j] % GOL.colors.schemes[GOL.colors.current].alive.length];

        } else {
          if (GOL.trail.current && this.age[i][j] < 0) {
            this.context.fillStyle = GOL.colors.schemes[GOL.colors.current].trail[(this.age[i][j] * -1) % GOL.colors.schemes[GOL.colors.current].trail.length];
          } else {
            this.context.fillStyle = GOL.colors.schemes[GOL.colors.current].dead;
          }
        }

        this.context.fillRect(this.cellSpace + (this.cellSpace * i) + (this.cellSize * i), this.cellSpace + (this.cellSpace * j) + (this.cellSize * j), this.cellSize, this.cellSize);
                
      },


      /**
       * Cambia la Celda
       */
      switchCell : function(i, j) {
        if(GOL.listLife.isAlive(i, j)) {
          this.changeCelltoDead(i, j);
          GOL.listLife.removeCell(i, j, GOL.listLife.actualState);
        }else {
          this.changeCelltoAlive(i, j);
          GOL.listLife.addCell(i, j, GOL.listLife.actualState);
        }
      },


      /**
       * Mantiene la celda viva
       */
      keepCellAlive : function(i, j) {
        if (i >= 0 && i < GOL.columns && j >=0 && j < GOL.rows) {
          this.age[i][j]++;
          this.drawCell(i, j, true);
        }
      },


      /**
       * cambia la celda activa
       */
      changeCelltoAlive : function(i, j) {
        if (i >= 0 && i < GOL.columns && j >=0 && j < GOL.rows) {
          this.age[i][j] = 1;
          this.drawCell(i, j, true);
        }
      },


      /**
       * cambia la celda muerta
       */
      changeCelltoDead : function(i, j) {
        if (i >= 0 && i < GOL.columns && j >=0 && j < GOL.rows) {
          this.age[i][j] = -this.age[i][j]; // mantiene su rastro
          this.drawCell(i, j, false);
        }
      }

    },


    /** ****************************************************************************************************************************
     *
     */
    listLife : {

      actualState : [],
      redrawList : [],


      /**
       *
       */
      init : function () {
        this.actualState = [];
      },


     
      nextGeneration : function() {
        var x, y, i, j, m, n, key, t1, t2, alive = 0, neighbours, deadNeighbours, allDeadNeighbours = {}, newState = [];
        this.redrawList = [];

        for (i = 0; i < this.actualState.length; i++) {
          this.topPointer = 1;
          this.bottomPointer = 1;
                    
          for (j = 1; j < this.actualState[i].length; j++) {
            x = this.actualState[i][j];
            y = this.actualState[i][0];

            // Posible muerte de la celda vecina
            deadNeighbours = [[x-1, y-1, 1], [x, y-1, 1], [x+1, y-1, 1], [x-1, y, 1], [x+1, y, 1], [x-1, y+1, 1], [x, y+1, 1], [x+1, y+1, 1]];

            // Optiene el numero de celdas vecinas vivas y lo remueve de la variable  deadNeighbours
            neighbours = this.getNeighboursFromAlive(x, y, i, deadNeighbours);

            // Une a los vecinos muertos para pasar lista
            for (m = 0; m < 8; m++) {
              if (deadNeighbours[m] !== undefined) {
                key = deadNeighbours[m][0] + ',' + deadNeighbours[m][1]; // Crea una Tabla
                
                if (allDeadNeighbours[key] === undefined) {
                  allDeadNeighbours[key] = 1;
                } else {
                  allDeadNeighbours[key]++;
                }
              }
            }

            if (!(neighbours === 0 || neighbours === 1 || neighbours > 3)) {
              this.addCell(x, y, newState);
              alive++;
              this.redrawList.push([x, y, 2]); // mantiene  vivo 
            } else {
              this.redrawList.push([x, y, 0]); // Mata la celda
            }
          }
        }

        // Proceso de muerte del vecino
        for (key in allDeadNeighbours) {
          if (allDeadNeighbours[key] === 3) { // Agrega una nueva celda
            key = key.split(',');
            t1 = parseInt(key[0], 10);
            t2 = parseInt(key[1], 10);
			
            this.addCell(t1, t2, newState);
            alive++;
            this.redrawList.push([t1, t2, 1]);
          }
        }

        this.actualState = newState;

        return alive;
      },


      topPointer : 1,
      middlePointer : 1,
      bottomPointer : 1,

      /**
             *
             */
      getNeighboursFromAlive : function (x, y, i, possibleNeighboursList) {
        var neighbours = 0, k;

        // Arriba
        if (this.actualState[i-1] !== undefined) {
          if (this.actualState[i-1][0] === (y - 1)) {
            for (k = this.topPointer; k < this.actualState[i-1].length; k++) {

              if (this.actualState[i-1][k] >= (x-1) ) {

                if (this.actualState[i-1][k] === (x - 1)) {
                  possibleNeighboursList[0] = undefined;
                  this.topPointer = k + 1;
                  neighbours++;
                }

                if (this.actualState[i-1][k] === x) {
                  possibleNeighboursList[1] = undefined;
                  this.topPointer = k;
                  neighbours++;
                }

                if (this.actualState[i-1][k] === (x + 1)) {
                  possibleNeighboursList[2] = undefined;

                  if (k == 1) {
                    this.topPointer = 1;
                  } else {
                    this.topPointer = k - 1;
                  }
                                    
                  neighbours++;
                }

                if (this.actualState[i-1][k] > (x + 1)) {
                  break;
                }
              }
            }
          }
        }
        
        // el medio
        for (k = 1; k < this.actualState[i].length; k++) {
          if (this.actualState[i][k] >= (x - 1)) {

            if (this.actualState[i][k] === (x - 1)) {
              possibleNeighboursList[3] = undefined;
              neighbours++;
            }

            if (this.actualState[i][k] === (x + 1)) {
              possibleNeighboursList[4] = undefined;
              neighbours++;
            }

            if (this.actualState[i][k] > (x + 1)) {
              break;
            }
          }
        }

        // Abajo
        if (this.actualState[i+1] !== undefined) {
          if (this.actualState[i+1][0] === (y + 1)) {
            for (k = this.bottomPointer; k < this.actualState[i+1].length; k++) {
              if (this.actualState[i+1][k] >= (x - 1)) {

                if (this.actualState[i+1][k] === (x - 1)) {
                  possibleNeighboursList[5] = undefined;
                  this.bottomPointer = k + 1;
                  neighbours++;
                }

                if (this.actualState[i+1][k] === x) {
                  possibleNeighboursList[6] = undefined;
                  this.bottomPointer = k;
                  neighbours++;
                }

                if (this.actualState[i+1][k] === (x + 1)) {
                  possibleNeighboursList[7] = undefined;
                                    
                  if (k == 1) {
                    this.bottomPointer = 1;
                  } else {
                    this.bottomPointer = k - 1;
                  }

                  neighbours++;
                }

                if (this.actualState[i+1][k] > (x + 1)) {
                  break;
                }
              }
            }
          }
        }
		
        return neighbours;
      },


      /**
       *
       */
      isAlive : function(x, y) {
        var i, j;
      
        for (i = 0; i < this.actualState.length; i++) {
          if (this.actualState[i][0] === y) {
            for (j = 1; j < this.actualState[i].length; j++) {
              if (this.actualState[i][j] === x) {
                return true;
              }
            }
          }
        }
        return false;
      },


      /**
       *
       */
      removeCell : function(x, y, state) {
        var i, j;
      
        for (i = 0; i < state.length; i++) {
          if (state[i][0] === y) {

            if (state[i].length === 2) { // Remueve toda la fila
              state.splice(i, 1);
            } else { // Remueve el Elemento
              for (j = 1; j < state[i].length; j++) {
                if (state[i][j] === x) {
                  state[i].splice(j, 1);
                }
              }
            }
          }
        }
      },


      /**
       *
       */
      addCell : function(x, y, state) {
        if (state.length === 0) {
          state.push([y, x]);
          return;
        }

        var k, n, m, tempRow, newState = [], added;

        if (y < state[0][0]) { //Agrega al comienzo
          newState = [[y,x]];
          for (k = 0; k < state.length; k++) {
            newState[k+1] = state[k];
          }

          for (k = 0; k < newState.length; k++) {
            state[k] = newState[k];
          }

          return;

        } else if (y > state[state.length - 1][0]) { // Agrega al final
          state[state.length] = [y, x];
          return;

        } else { // Agrega a la mitad

          for (n = 0; n < state.length; n++) {
            if (state[n][0] === y) { // Nivel Actual
              tempRow = [];
              added = false;
              for (m = 1; m < state[n].length; m++) {
                if ((!added) && (x < state[n][m])) {
                  tempRow.push(x);
                  added = !added;
                }
                tempRow.push(state[n][m]);
              }
              tempRow.unshift(y);
              if (!added) {
                tempRow.push(x);
              }
              state[n] = tempRow;
              return;
            }

            if (y < state[n][0]) { // Crea Nivel
              newState = [];
              for (k = 0; k < state.length; k++) {
                if (k === n) {
                  newState[k] = [y,x];
                  newState[k+1] = state[k];
                } else if (k < n) {
                  newState[k] = state[k];
                } else if (k > n) {
                  newState[k+1] = state[k];
                }
              }

              for (k = 0; k < newState.length; k++) {
                state[k] = newState[k];
              }

              return;
            }
          }
        }
      }

    },


    /** ****************************************************************************************************************************
     *
     */
    helpers : {
      urlParameters : null, // Cache


      /**
       * Regresa variables aleatorias desde [min, max]
       */
      random : function(min, max) {
        return min <= max ? min + Math.round(Math.random() * (max - min)) : null;
      },


      /**
       * Obtiene los parametros desde url
       */
      getUrlParameter : function(name) {
        if (this.urlParameters === null) { // Perdida del Cache
          var hash, hashes, i;
        
          this.urlParameters = [];
          hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

          for (i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            this.urlParameters.push(hash[0]);
            this.urlParameters[hash[0]] = hash[1];
          }
        }

        return this.urlParameters[name];
      },


      /**
       * Registro de Evento
       */

      registerEvent : function (element, event, handler, capture) {
        if (/msie/i.test(navigator.userAgent)) {
          element.attachEvent('on' + event, handler);
        } else {
          element.addEventListener(event, handler, capture);
        }
          
        
      },


      /**
       *
       */
      mousePosition : function (e) {
        
        var event, x, y, domObject, posx = 0, posy = 0, top = 0, left = 0, cellSize = GOL.zoom.schemes[GOL.zoom.current].cellSize + 1;

        event = e;
        if (!event) {
          event = window.event;
        }
      
        if (event.pageX || event.pageY) 	{
          posx = event.pageX;
          posy = event.pageY;
        } else if (event.clientX || event.clientY) 	{
          posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
          posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        domObject = event.target || event.srcElement;

        while ( domObject.offsetParent ) {
          left += domObject.offsetLeft;
          top += domObject.offsetTop;
          domObject = domObject.offsetParent;
        }

        domObject.pageTop = top;
        domObject.pageLeft = left;

        x = Math.ceil(((posx - domObject.pageLeft)/cellSize) - 1);
        y = Math.ceil(((posy - domObject.pageTop)/cellSize) - 1);

        return [x, y];
      }
    }

  };


  /**
   * Inicia la carga de eventos
   */
  GOL.helpers.registerEvent(window, 'load', function () {
    GOL.init();
  }, false);

}());
