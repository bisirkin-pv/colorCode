;(function(){    
    "use strict";
    
    let version = '0.0.2'
        ,lastUpdateDate = '10.08.2017';         
    var isDebug = true                          //флаг режима отладки
        ,syntax = {}                            //Хранит найденные языки
        ,htmldata = 'data-colorCode'            //атрибут для поиска
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
    // Object: ColorCode, вернуть последнюю дату изменения
    function getLastUpdateDate(){
        return lastUpdateDate;
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
        var actual_JSON = "";
        _loadJSON(patch||'', function(response) {
            try{
                actual_JSON = JSON.parse(response);                
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
    }
    // Создает текстовый блок с текстом и подстветкой
    /* return: txt - итоговый текст обернутый
        txt - текст для поиска и замены        
        , syntax - синтаксис текста
       
    */
    function _CodeBlock(txt, syntax){
        if(typeof syntax != "object") {return 0;}
        for(var i = 0; i < syntax.codeBase.length; i++){
            txt = txt + ' ';
            txt = txt.replace(new RegExp(syntax.codeBase[i].tag+'[ \n]+','g'),"<span style='color:"+syntax.codeBase[i].color+"; font-weight:"+syntax.codeBase[i].bold+"'>" + syntax.codeBase[i].tag + " </span>")
                
            ;            
        }
        return txt.substring(0, txt.length - 1);
    }
    
    // Object: ColorCode, ищет все элементы на страницы и добавлет им подстветку
    /*
        selector  - css сеелктор к элементу с текстом
        , selectorTarget - css сеелктор к элементу для вставки текста
        , isRemove - флаг удалять исходный элемент или нет
    */
    function init(selectorSource, selectorTarget, isRemove){
        var sourceElement = document.querySelector(selectorSource)
            ,txt = ""
            ,elemText = ""
        ;
        if(sourceElement.value){
            elemText = sourceElement.value;
        }else if(sourceElement.innerHTML){
            elemText = sourceElement.innerHTML;
        }
        txt = _CodeBlock(elemText, syntax[sourceElement.getAttribute(htmldata)]); 
        if(txt==""){return 0;}
        let targetElement = document.querySelector(selectorTarget);
        if(targetElement==null){
            sourceElement.insertAdjacentHTML("afterEnd", '<div class="colorCode" id="colorCode">' + txt +'</div>');
        }else{            
            targetElement.innerHTML = txt;   
            targetElement.className = "colorCode";
        }
                
        if(isRemove){
            sourceElement.remove();
        }
    }
    // Object: ColorCode, Устанавливает слушателя для обновления при изменении
    function addListener(sourceElementId, targetElementId){
        let sourceElement = document.querySelector(sourceElementId);              
                sourceElement.addEventListener("blur", function(){
                    init(sourceElementId, targetElementId, false)
                }, true);
    }
    
    //Функции доступные из вне
    ColorCode.getVersion = getVersion;
    ColorCode.getLastUpdateDate = getLastUpdateDate;
    ColorCode.addSyntax = addSyntax;
    ColorCode.init = init;
    ColorCode.addListener = addListener;
    
    // "экспортировать" ColorCode наружу из модуля
    window.ColorCode = ColorCode;
}());