/*
 * 作者: kingsimon 2015-12-20
 * 说明:依赖jquery
 *
 * 方法名:mergeCols
 * 方法说明:合并列
 * 调用:
 * $('#tableid').mergeCols(1)
 * $('#tableid').mergeCols([2,3,5],1)
 * $('#tableid').mergeCols(1,false,function(text1,text2){return text1.substr(0,10)==text2.substr(0,10)})
 * 参数说明:
 * @param 合并列的数组或合并列，如 [2,3,4]将2,3,4列合扫行合并,列数从1开始 1 2 3....
 * @param 主列,按此列合并分组,别的列合并时.以此列的合并为标准界限,不能跨组合并，主列必须已被合并
 * @param 判断规则方法,默认判断内容一致则合并
 *
 * 方法名:mergeRecover
 * 方法说明:恢复被合并项
 * 调用:
 * $('#tableid').mergeRecover(true)
 * 参数说明:
 * @param 布尔值，为true时不恢复被合并项，但保留被合并的隐藏项
 *
 * 方法名:mergeRemove
 * 方法说明:清除隐藏项
 * 调用:
 * $('#tableid').mergeRemove()
 * 参数说明:
 * 无
 *
 * 方法名:recoverCols
 * 方法说明:恢复由mergeCols方法合并的合并列
 * 调用:
 * $('#tableid').recoverCols(1)
 * $('#tableid').recoverCols([2,3,5])
 * 参数说明:
 * @param 恢复合并列的数组或恢复合并列，如 [2,3,4]将2,3,4的合并列扫行恢复,列数从1开始 1 2 3....
 */
;
(function($) {
  var types = []; //根据主列来记录分隔行的数组
  var mergerCols = [];
  var $mainCol;
  $.fn.mergeCols = function(cols,main,func) {
    if(typeof cols == "number"){
      cols = [cols];
    }
    if(main){
      var that = this;
      mergerCols = [];
      types = [];
      var $mainCol = $(_formatString(main), that);
      $.each(cols, function() {
        mergerCols.push($(_formatString(this), that));
      });
      $.each($mainCol, function(index) {
        if($(this).css('display') != 'none'){
          types.push(index);
        }
      });
      $.each(mergerCols, function() {
        _mergeCols(this,func);
      });
    }else{
      var that = this;
      mergerCols = [];
      types = [];
      $.each(cols, function() {
        mergerCols.push($(_formatString(this), that));
      });
      $.each(mergerCols, function() {
        _mergeCols(this,func);
      });
    }
  };

  $.fn.mergeRecover = function(hide) {

    //清除隐藏项
    $.each($(this).find('tbody>tr>td'), function() {
      if ($(this).css('display') == "none") {
        $(this).remove();
      }
    });
    //恢复列数
    $.each($(this).find('tbody>tr'), function(x) {
      $.each($(this).find('td'), function(y) {
        // var rowspan = Number($(this).attr('rowspan')) || 1;
        var colspan = Number($(this).attr('colspan')) || 1;
        if (colspan > 1) {
          for (var k = 0; k < colspan - 1; k++) {
            var $obj = $(this).clone(true).removeAttr('colspan').removeAttr('rowspan');
            $(this).after($obj);
            $obj.addClass('hide');
          }
        }
      });
    });
    //恢复行数
    var list = $.map($(this).find('tbody>tr'), function(elem, index) {
      return $(elem).find('td').length;
    });
    var len1 = Math.max.apply(null, list);
    var len2 = $(this).find('tbody>tr').length;
    for (var i = 0; i < len1; i++) {
      for (var j = 0; j < len2; j++) {
        var $item = $(this).find('tbody>tr:nth-child(' + (j + 1) + ')>td:nth-child(' + (i + 1) + ')');
        var rowspan = Number($item.attr('rowspan')) || 1;
        // var colspan = Number($item.attr('colspan')) || 1;
        if (rowspan > 1) {
          for (var k = 0; k < rowspan - 1; k++) {
            var $obj = $item.clone(true).removeAttr('colspan').removeAttr('rowspan');
            var $after = $(this).find('tbody>tr:nth-child(' + (j + k + 2) + ')>td:nth-child(' + (i + 1) + ')');
            $after.before($obj);
            $obj.addClass('hide');
          }
        }
      }
    }
    if (!hide) {
      //还原项
      $.each($(this).find('tbody>tr>td'), function() {
        $(this).removeAttr('colspan').removeAttr('rowspan').removeClass('hide');
      });
    }
  }

  $.fn.mergeRemove = function() {
    //清除隐藏项
    $.each($(this).find('tbody>tr>td'), function() {
      if ($(this).css('display') == "none") {
        $(this).remove();
      }
    });
  }

  $.fn.recoverCols = function(cols) {
    var that = this;
    if(typeof cols == "number"){
      cols = [cols];
    }
    $.each(cols, function() {
      $(_formatString(this), that).removeAttr('colspan').removeAttr('rowspan').removeClass("hide");
    })
  }

  //格式化选择字符串
  var _formatString = function(str) {
    return 'tbody>tr>td:nth-child(' + str + ')';
  }

  //私有方法,合并列用
  var _mergeCols = function(arr,func) {

    var testFunc = function(text1,text2){
      return text1 == text2;
    }
    if(typeof func == "function"){
      testFunc = func;
    }


    for (var count = arr.length - 1, row = 1; count >= 0; count--) {

      var $tmp2 = $(arr[count]);
      if (count == 0) {
        $tmp2.attr('rowspan', row);
      } else if ($.inArray(count, types) >= 0 || !testFunc.call(this,arr.get(count).innerText,arr.get(count - 1).innerText)) {
        $tmp2.attr('rowspan', row);
        row = 1;
      } else {
        $tmp2.addClass('hide');
        row++;
      }
    }
  }
})(jQuery)
