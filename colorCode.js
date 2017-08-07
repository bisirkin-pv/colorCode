;(function(){    
    "use strict";
    
    let version = '0.0.1';
    var isDebug = true                          //флаг режима отладки
        ,syntax = {}                            //Хранит найденные языки
        ,htmldata = 'data-colorCode'                 //атрибут для поиска
    ;
    
    // вывод сообщений в режиме дебага
    function debuglog(msg){
        if(!!isDebug) {console.log(msg)};
    }
    //конструктор
    function ColorCode(){
    }
    // Object: ColorCode, вернуть текущую версию
    function getVersion(){
        return version;
    }
    
    //Загрузка файла в формате JSON
    function _loadJSON(file, callback) {   
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType("application/json");
        xhr.open('GET', file, false);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == "200") {
                callback(xhr.responseText);
                }
        };
        xhr.send(null);  
     }
    
    // Object: ColorCode, заполнение из JSON файла
    function _load(patch) {
        var actual_JSON;
        _loadJSON(patch||'', function(response) {
            try{
                actual_JSON = JSON.parse(response);
                if(actual_JSON){                    
                    debuglog(actual_JSON);
                    debuglog(Object.keys(actual_JSON));
                }
            }catch(ex){
                debuglog('ColorCode.load: Ошибка парсинга объекта');
            }
        });
        return actual_JSON;
    };
    

    // Еденица разметки
    function Code(tag, bold, color){
            this.tag = tag;
            this.bold = bold;
            this.color = color;
    }
    // Объект хранит все стили для синтаксиса
    function Syntax(name){
        this.name = name;
        this.codeBase = [];
    }
    Syntax.prototype.add = function(tag, bold, color){
        this.codeBase.push(new Code(tag, bold, color));
    }
    
    // Object: ColorCode, добавляет синтаксис
    function addSyntax(patch){
        var jsonObject = _load(patch);
        let jsonKey = Object.keys(jsonObject);
         var bold = ""
            ,color = "";
        syntax[jsonKey] = new Syntax(jsonKey[0]);
        for(var i = 0; i < jsonObject[jsonKey].length; i++){
            Object.keys(jsonObject[jsonKey][i]).map(function(objectKey, index) {
                var value = jsonObject[jsonKey][i][objectKey];
               
                if(objectKey=="bold"){
                    bold = value;
                    
                }
                if(objectKey=="color"){
                    color = value;
                }
                
                if(typeof value =="object"){
                     Object.keys(value).map(function(tagKey, indexTag) {
                         var value = jsonObject[jsonKey][i][objectKey][tagKey];
                         syntax[jsonKey].add(value.name, bold, color);
                     });
                }
            });
        };
        debuglog(syntax);
    }
    // Создает текстовый блок с текстом и подстветкой
    /* return: txt - итоговый текст обернутый в div
        txt - текст для поиска и замены
        , syntax - синтаксис текста
       
    */
    function _CodeBlock(txt, syntax){
        debuglog(syntax);
        if(typeof syntax != "object") {return 0;}
        debuglog("Работаем");
        for(var i = 0; i < syntax.codeBase.length; i++){
            txt = txt.replace(new RegExp(syntax.codeBase[i].tag+'[ ]+','g'),"<span style='color:"+syntax.codeBase[i].color+"; font-weight:"+syntax.codeBase[i].bold+"'>" + syntax.codeBase[i].tag + " </span>")
                
            ;            
        }        
        return '<div class="colorCode">' + txt +'</div>';     
    }
    
    // Object: ColorCode, ищет все элементы на страницы и добавлет им подстветку
    /*
        selector  - css сеелктор к элементу с текстом
        , isRemove - флаг удалять исходный элемент или нет
    */
    function init(selector, isRemove){
        var elem = document.querySelectorAll(selector)
            ,txt = ""
        ;
        
        elem.forEach(function(obj, index){            
            txt = _CodeBlock(obj.value, syntax[obj.getAttribute(htmldata)]); 
            if(txt==""){return 0;}
            debuglog(txt);
            obj.insertAdjacentHTML("afterEnd", txt);
            if(isRemove){
                obj.remove();
            }
        })
        
    }
    //Функции доступные из вне
    ColorCode.getVersion = getVersion;
    ColorCode.addSyntax = addSyntax;
    ColorCode.init = init;
    
    // "экспортировать" ColorCode наружу из модуля
    window.ColorCode = ColorCode;
}());