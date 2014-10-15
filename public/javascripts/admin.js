function init(){

  $('button.add.projectImage').click(function(){
    var $this = $(this)
    var inputGroup = $this.siblings('.input-group')
    var inputs = inputGroup.children('input')
    console.log(inputs[0])
    var input = $(inputs[0]).clone()
    //input.val('')
    inputGroup.append(input)

  })

  $('.delete').click(function(e){
    if(!confirm('*****************************************************\n\t\t\t\tWARNING\n*****************************************************\n\n\rDeleting this item cannot be undone.\nAre you sure you want to proceed?\n\r')) e.preventDefault()
  })
  $('.remove').click(function(e){
    if(!confirm('*****************************************************\n\t\t\t\tWARNING\n*****************************************************\n\n\rRemoving this item cannot be undone.\nAre you sure you want to proceed?\n\r'))
    {
      e.preventDefault()
    }else{
      var p = $(this).parent()
      var img = p.children('img')
      var imgsrc = img.attr('src')
      img.remove()
      $('<input>').attr('type','hidden').attr('name','images-deleted').attr('value',imgsrc).appendTo(p)
      p.hide()

    }
  })

}
