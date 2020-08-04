function getIndex(list, id) {
    for (let i = 0; i < list.length ; i++) {
        if(list[i] === id){
            return i;
        }
    }
    return -1;
}

var messageApi = Vue.resource('/message{/id}');


Vue.component('message-form', {
    props: ['messages', 'messageA'],
    data: function () {
        return {
            text: '',
            id: ''
        }
    },
    watch: {
        messageA: function(newVal, oldVal){
            this.text = newVal.text;
            this.id = newVal.id;
        }
    } ,
    template:
        '<div>' +
        '<input type="text" placeholder="Write your message" v-model="text"/>   ' +
        '<input type="button" value="Save" v-on:click="save"/>   ' +
        '</div>',
    methods: {
        save: function () {
          let message = {text : this.text};

          if(this.id){
              messageApi.update({id: this.id}, message).then(result =>
              result.json().then(data => {
                  let index = getIndex(this.messages,data.id);
                  this.messages.splice(index, 1, data);
              })
              )
          }else {
              messageApi.save({}, message).then(result =>
                  result.json().then(data => {
                      this.messages.push(data);
                      this.text = '';
                      this.id = '';
                  })
              )
          }
    }
}
});

Vue.component('message-row',{
    props : ['message' , 'editMethod', 'messages'],
    template : '<div>'+
                '<i>({{message.id}})</i> {{message.text }}' +
                '<span style="position: absolute; right: 0">'+
                    '<input type="button" value="Edit" @click="edit" /> '+
                    '<input type="button" value="x" @click="del" /> '+
                '</span>'+
               '</div>',
    methods: {
        edit : function () {
            this.editMethod(this.message);
        },
        del: function () {
            messageApi.remove({id: this.message.id}).then(result => {
                if(result.ok){
                    this.messages.splice(this.messages.indexOf(this.message), 1)
                }
            })
        }

    }

    });


Vue.component('massages-list', {
    props : ['messages'],
    data: function(){
        return{
            message : null
        }
    },
    template :
        '<div style="position: relative; width: 300px">'+
        '<message-form :messages="messages" :messageA="message" />'+
        '<message-row v-for="message in messages" :key="message.id" :message="message" :messages="messages" :editMethod="editMethod"/>' +
        '</div>',
    created: function () {
        messageApi.get().then(result => result.json().then(
            data => data.forEach(message => this.messages.push(message))
        ))

    },
    methods: {
        editMethod : function (message) {
            this.message = message;
        }
    }
});

var app = new Vue({
    el: '#app',
    template: '<massages-list :messages="messages" />',
    data: {
        messages: []
    }
})