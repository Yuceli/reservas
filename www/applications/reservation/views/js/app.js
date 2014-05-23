var baseUrl = window.location.protocol + "//" + window.location.host;
var reservation = {
  id:0,
  name:'',
  seats:0,
};

var mySeats = [];

function success_reserveSeats(data) {
  // body...
  BootstrapDialog.confirm("Su reservación ha sido guardada\nUse su número de reservación para cancelaciones de asientos", function(result){
    if(result) {
      window.location = baseUrl;
    }else{
      window.location = baseUrl;
    }
  });
}

function reserveSeats() {
  // body...
  ajax.post(
    'reservation/make_reservation',
    {id:reservation.id},
    success_reserveSeats,
    function() {
      BootstrapDialog.confirm(
        "Su reservación ha sido guardada\nUse su número de reservación para cancelaciones de asientos\nNúmero de Reservación: " + reservation.id + "",
        function(result){
          if(result) {
            window.location = baseUrl;
          }else{
            window.location = baseUrl;
          }
        });
      }
    );
  }

  function success_getReservationData(data) {
    // body...
    reservation.id = data.ID_Reservation;
    reservation.name = data.Name;
    reservation.seats = data.Seats;

    $('#resv-name').html(reservation.name);
    $('#resv-id').html(reservation.id);

  }

  function getReservationData() {

    ajax.get(
      'reservation/get_reservation_data',
      success_getReservationData,
      function(argument) {
        // body...
      }
    );
  }

  function error_fun() {
    BootstrapDialog.alert({
      type: BootstrapDialog.TYPE_WARNING,
      title: 'Operacion no disponible',
      message: 'La operación deseada no puede llevarse a cabo, intente más tarde o reporte este error al administrador del sistema.'
    });
  }

  function success_updateSeats(data) {

    var list = data;
    $('.seat').each(function() {
      var currentSeat = $(this);
      $.each(list, function(index, seatObject) {
        if( currentSeat.data('position') == seatObject.Position ){
          currentSeat.data('status', seatObject.Status);
          currentSeat.data('reservation', seatObject.Reservation);
        }
      });
      $(this).removeClass('btn-default btn-success btn-warning btn-primary');
      switch ($(this).data('status')) {
      case 'free':
        $(this).addClass('btn-success');
        break;
      case 'aparted':
        if( $(this).data('reservation') == reservation.id ){
          $(this).data('status', 'mine');
          $(this).addClass('btn-default');
        }else{
          $(this).addClass('btn-primary');
        }
        break;
      case 'reserved':
        $(this).addClass('btn-warning');
        break;
      default:
        break;

      }
    });

  }

  function success_apartSeat(data) {
    // getReservationData();
    $('.seat').each(function() {
      // if( $(this).data('position') == data.position ){
      //   reservation.seats++;
      // }
    });
  }

  function success_freeSeat(data) {
    // getReservationData();
    $('.seat').each(function() {
      // if( $(this).data('position') = data.position ){
      //   var pos = "#list-" + $(this).data('position') + "";
      //   alert(pos);
      //   $(pos).remove();
      //   reservation.seats--;
      // }
    });
  }

  function freeSeat(seat) {
    // body...
    var data = seat;
    ajax.post(
      'reservation/free_seat',
      data,
      success_freeSeat,
      error_fun
    );
  }

  function apartSeat(seat) {
    // body...
    var data = seat;
    ajax.post(
      'reservation/apart_seat',
      data,
      success_apartSeat,
      error_fun
    );
  }

  function getMySeats() {
    // body...
    ajax.get(
      'reservation/my_seats_data/'+reservation.id,
      function(data) {
        // body...
        mySeats = data;
        var element = "";
        $.each(mySeats ,function(index, object) {
          element += "<li>" + object.Position + "</li>";
        });
        $('#my-seats-list').html(element);
      },
      function() {
        // body...
        // alert('No se actualiza');
      }
    );
  }

  function updateSeats() {
    ajax.get(
      'reservation/get_seats',
      success_updateSeats,
      function(argument) {
        // body...
      }
    );
  }

  idleMax = 1;// Logout after 1 minute of IDLE
  idleTime = 0;

  function timerIncrement() {
    idleTime = idleTime + 1;
    if (idleTime > idleMax) {
      // window.location = window.location.protocol + "//" + window.location.host + "/reservation/freeAllSeats/" + reservation.id;
      ajax.get(
        'reservation/freeAllSeats/'+reservation.id,
        function(data) {
        },
        function() {
        }
      );
    }
  }

  function updateView() {
    // body...
    getReservationData();
    getMySeats();
    updateSeats();
    setTimeout(updateView, 500);
  }
  /******************************************************************************
  * Document Ready of Jquery
  *******************************************************************************
  */
  $(document).ready(function () {
    //Inicializar toda la tabla de Asientos
    updateView();

    // Listener del boton de reservacion de asientos
    $('#btn-reserv').on('click', function() {
      BootstrapDialog.confirm('¿Desea confirmar su reserva?', function(result){
        if(result) {
          //Implement the reservation function
          reserveSeats();
        }
      });
    });


    //Listener de acciones del click de cada Asiento
    //En esta section se debe hacer las llamadas al servidor y actualizar el color del asiento
    //
    $('.seat').each(function(){
      $(this).on('click', function(){

        switch($(this).data('status')){ //Iterar en el estado del asiento
        case 'free':
          if(reservation.seats < 5){
            var mySeat = {
              Position: $(this).data('position'),
              Status: 'aparted'
            };
            //implement apart function
            apartSeat(mySeat);
          }else{
            BootstrapDialog.alert({
              type: BootstrapDialog.TYPE_WARNING,
              title: 'Alerta!!!',
              message: 'Solo se tiene un maximo de 5 asientos por reservación.'
            });
          }
          break;

        case 'reserved':
          //It's aparted ando you can't change that
          BootstrapDialog.alert({
            type: BootstrapDialog.TYPE_WARNING,
            title: 'Alerta!!!',
            message: 'Este lugar ya se encuentra reservado'
          });
          break;

        case 'aparted':
          //It's aparted ando you can't change that
          BootstrapDialog.alert({
            type: BootstrapDialog.TYPE_WARNING,
            title: 'Alerta!!!',
            message: 'Este lugar ya se encuentra apartado por otro usuario.'
          });
          break;

        case 'mine':
          var mySeat = {
            Position: $(this).data('position'),
            Status: 'free'
          };
          //implement free function
          freeSeat(mySeat);
          break;

        default:
          break;
        }
      });
    });

    // $(window).bind('beforeunload', function(){
    //   return 'Aún no ha finalizado su reservación.\n¿Está seguro que desea salir de esta página?';
    // });

    var idleInterval = setInterval("timerIncrement()", 6000);
    $(this).mousemove(function (e) {idleTime = 0;});
    $(this).keypress(function (e) {idleTime = 0;});

  });
