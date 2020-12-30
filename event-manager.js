/*
    // Пример использования:
    
    var eventManager = new EventManager();

    var idEvent = eventManager.on('who_is_here?', function(obj) {
        alert('me!');
    });    
    
    eventManager.on('who_is_here?', function(obj) {
        alert('and me! ' + obj.arg);
    });

    x.trigger('who_is_here?', {arg: 123}); 
    // result:
    // me!
    // and me! 123

    x.killEventOfId(idEvent);
    
    x.trigger('who_is_here?', {arg: 456}); 
    // result:
    // and me! 456
    
    x.reset();
*/

var EventManager = function() {
    
    var 
        storage = [],       // массив с коллбеками
        idCount = 1000;     // Уникальный id события
    // -----
    
    this.on = function(event, callback) {
        idCount++;
        storage.push({
            event: event,
            callback: callback,
            idCount: idCount
        });
        
        return idCount;
    };
    
    this.trigger = function(event, obj) {
        var length = storage.length;
        for(i=0;i<length;i++) {
            if(storage[i].event == event) {
                storage[i].callback(obj);
            }
        }
    };
    
    this.reset = function() {
        storage = [];
        
        // закомментировано чтобы случайно не удалить новый элемент
        // id всегда будут уникальными на время запуска
        //idCount = 1000; 
    };
    
    // Удаление конкретного коллбека
    this.killEventOfId = function(id) {
        var length = storage.length;
        while(length--) {
            if(storage[length].idCount == id) {
                storage.splice(length, 1);
            }
        }
    };
};

