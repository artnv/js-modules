var Router = function(routesMap) {
    
    // Объект с данными который вернется в коллбек
    var returnObject    = {
        hash            : undefined,
        hashParams      : {},
        queryParams     : {},
        action          : undefined // имя коллбека
    };
    
    // Регистрация обработчиков событий
    var initEvents = function() {
        window.addEventListener("hashchange", function(e) {
           parseUrl();
        }, false);
    };
    
    // Событие которое вызывается при первом запуске и при изменении hashchange
    var eventFirstStartAndHashchange = function(returnObject) {
        if(routesMap.events && routesMap.events.firstStartAndHashchange) routesMap.events.firstStartAndHashchange(returnObject);
    };
    
    // Открытие страницы. Первый запуск
    this.init = function() { 
        initEvents();
        parseUrl();
    };   
    
    this.redirectTo = function(url) {
        // Simulate a mouse click:
        window.location.href = url;
    };
    
    // Разбирает параметры запросы типа "?cat=123&id=456" и возвращает объект вида {ключ:значение}
    var getQueryParams = function() {
        
        var queryString     = window.location.search;
        var searchParams    = new URLSearchParams(queryString);
        var returnObj       = {};

        returnObj.queryString = queryString;
        returnObj.params = {};
        
        for(var pair of searchParams.entries()) {
           returnObj.params[pair[0]] = pair[1];
        }

        return returnObj;
    };
    
    // Разбирает url и вызывает коллбек маршрута
    /*
        1. Проходится циклом по всем маршрутам и работаем с ними
        2. Находим в маршруте переменные типа :id, :cat, :etc
        3. В копии маршрута заменяем все переменные на регулярные выражение типа (.+). "#/catalog/tv/page/123" -> "#/catalog/(.+)/page/(.+)"
        4. Выполняем поиск данных в hash("#/catalog/tv/page/123") по шаблону "#/catalog/(.+)/page/(.+)"
        5. Создаем еще одну копию маршрута и заменяем переменные на полученные данные из хеша. Далее сравниваем маршрут с хешем
        6. Создаем возвращаемый объект вида {cat: 'tv', page: 123}
        7. Вызов коллбека и событий
    */
    var parseUrl = function() {
        
        var hash            = location.hash;
        var urlNotFound     = true; 
        var queryObj        = getQueryParams();
        
        returnObject.queryString    = queryObj.queryString;
        returnObject.queryParams    = queryObj.params;
        returnObject.hash           = hash;
        
        for(var route in routesMap.routes) {
            
            // Делаем копию с которой будем работать и заменить в ней данные
            var templateRoute       = route;
            var secondTemplateRoute = route;
            
            // Поиск переменных: #/catalog/:cat/page/:id
            //var variables = templateRoute.match(/(\(\?)?:\w+/g);
            var variables = templateRoute.match(/:\w[\w\d-_]+/gi);

            // Если в url есть переменные
            if(variables) {
                
                // Замена переменных типа "#/page/:id" на регулярное выражение "#/page/(.+)"
                for(var i=0;i<variables.length;i++) {
                    templateRoute = templateRoute.replace(variables[i], '(.+)');
                }

                // Экранирование слешей под регулярное выражение
                templateRoute = templateRoute.replaceAll('\/', '\\/');
                
                // Поиск данных для переменных по сгенерированному шаблону "#/catalog/tv/page/123" => ['tv', 123] 
                var variablesData = hash.match(templateRoute);

                // Создание объекта со свойствами (имя переменных из шаблона url : их значение)
                for(var k=0, j=1; k <= variables.length; k++, j++) {
                    if(variablesData && variablesData[j]) {
                        // Формирует url из шаблона+данные для сравнения с текущим
                        secondTemplateRoute = secondTemplateRoute.replace(variables[k], variablesData[j]);
                        
                        // Создание объекта со свойствами, перед созданием у имени свойства убираем символ - ":"
                        // {свойство : данные}
                        returnObject.hashParams[variables[k].replace(':', '')] = variablesData[j];
                    }
                }
      
                // Сравнение текущего url с тем который мы собрали из шаблона+данные
                if(hash == secondTemplateRoute) {
                    
                    urlNotFound = false;
                    
                    // Вызов коллбека
                    returnObject.action = routesMap.routes[route];
                    routesMap[routesMap.routes[route]](returnObject);
                    
                    // Вызов события
                    eventFirstStartAndHashchange(returnObject);
                }
                
            } else {
                // Если нету переменных в url
                if(hash == templateRoute) {
                    
                    urlNotFound = false;
                    
                    // Вызов коллбека
                    returnObject.action = routesMap.routes[route];
                    routesMap[routesMap.routes[route]](returnObject);
                    
                    // Вызов события
                    eventFirstStartAndHashchange(returnObject);
                }
            } 
        }

        // Если никакой маршрут не найден, вызывается специальный коллбек. 
        // Можно использовать например для ошибки 404
        if(urlNotFound) {
            // Если есть специальный шаблон то запускаем его коллбек
            if(routesMap.routes['*random']) {
                
                // Вызов коллбека
                returnObject.action = routesMap.routes['*random'];
                routesMap[routesMap.routes['*random']](returnObject);
                
                // Вызов события
                eventFirstStartAndHashchange(returnObject);
            }
        }
    };
    
};

var map = {
    routes: {
        ''                  : 'welcomeIndex',
        '#/welcome'         : 'welcomeIndex',
        '#/demo/index/:id/page/:page'      : 'demoIndex',
        '#/demo/about'      : 'demoAbout',
        '*random'           : 'pageNotFound'
    },
    
    events: {
        firstStartAndHashchange : function(obj) {
            EVENT_MANAGER.trigger("Router@Action", obj);
        },
    },
  
    // Actions

    /* === demo === */

    demoIndex   : function (obj) {
       EVENT_MANAGER.trigger("Router/demo/index", obj);
    },   
    
    demoAbout   : function (obj) {
       EVENT_MANAGER.trigger("Router/demo/about", obj);
    },
    
    pageNotFound: function(obj) {
        EVENT_MANAGER.trigger("Router/demo/pageNotFound", obj);
    },
    
    /* === welcome === */
    welcomeIndex    : function (obj) {
       EVENT_MANAGER.trigger("Router/welcome/index", obj);
    },
};

var r = Router(map);
r.init();
