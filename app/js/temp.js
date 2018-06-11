async function deleteCircle() {
  subCount();
  canvas.remove(canvas.getActiveObject());
  // await subCount();
}
function addCount() {
  con.connect(function (err) {
      // in case of error
      if (err) {
          console.log(err.code);
          console.log(err.fatal);
      }

      var species = getSpecies();
      var sql = "INSERT INTO count SET species = ?";
      con.query(sql, species, function (err, result) {
          if (err) throw err;
          console.log(result);
          markerID = result.insertId;
          console.log(markerID);
      });
      console.log(getMaxID());
  });
  getCount();
}

var query = function(sql){
  return new Promise(function(resolve,reject){
      var returnValue = "";
      con.query(sql,function(error,rows){
          if(error){
              returnValue = "";
          }
          else {
              returnValue = rows[0].maxid;
              // console.log("in function result: "+ returnValue);
          }
          resolve(returnValue);
      });
  });
}

var getMaxID = async function () {
  var sql = "SELECT MAX(id) as maxid FROM count";
  let result = await query(sql);
  // console.log("out function result: " + result);
  return result;
}

async function subCount() {
  var maxID;
  maxID = await getMaxID();
  //consider truncate table https://dev.mysql.com/doc/refman/8.0/en/truncate-table.html if this method doesn't work
  var sql = "ALTER TABLE count AUTO_INCREMENT = " + maxID;
  await con.query(sql, function(err, result){
      if(err) throw err;
      console.log(result);
  });

  var subID = canvas.getActiveObject.id;
  console.log(canvas.getActiveObject.id);
  console.log(subID);
  var sql = "DELETE FROM count WHERE id = ?";
  con.query(sql, subID, function (err, result) {
      if (err) throw err;
      console.log(result);
  });
  getCount();
}


function drawDot() {
  var pointer = canvas.getPointer(event.e);
  addCount();
  var circle = new fabric.Circle({
      left: pointer.x,
      top: pointer.y,
      fill: 'red',
      radius: 5,
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingFlip: true,
      lockScalingX: true,
      lockScalingY: true,
      lockUniScaling: true,
      id: markerID,
  });
  // circle = { id: markerID };
  console.log(markerID, circle.id);
  circle.setControlsVisibility({
      bl: false,
      br: false,
      tl: false,
      tr: false,
      mt: false,
      mb: false,
      ml: false,
      mr: false,
      mtr: false,
  });
  canvas.add(circle);

}