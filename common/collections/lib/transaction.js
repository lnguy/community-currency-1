Transactions = new Mongo.Collection("transactions");
Transactions.allow({
  insert: function(userId, doc){
    return !!userId && sender._id === userId;
  },
  update: function(){
    return false;
  },
  remove: function(){
    return false;
  }
});
