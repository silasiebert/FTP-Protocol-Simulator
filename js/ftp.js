$(document).ready(function () {
    $('[data-toggle="popover"]').popover();
});

function request(codigo, parametro, succes) {
    var resultado = "";

    switch (codigo) {
        case "USER":
            resultado += "220 " + parametro + "Service ready for new user." + "\n";
            if (succes) {
                resultado += "331 " + parametro + " OK, password required" + "\n";
            } else {
                resultado += "332 " + parametro + " Need account for login." + "\n";
            }
            break;
        case "PASS":
            if (!succes) {

                resultado += "430 " + parametro + " Invalid username or password" + "\n";
            } else {
                resultado += "230 " + parametro + " User logged in, proceed. Logged out if appropriate." + "\n";

            }
            break;
        case "PORT":
            resultado += "200 " + parametro + "The requested action has been successfully completed." + "\n";
            break;
        case "LIST":
            if (succes) {
                resultado += "200 " + parametro + "File status okay; about to open data connection.." + "\n";
                resultado += "150 " + parametro + "File status okay; about to open data connection." + "\n";
                resultado += "226 " + parametro + "Closing data connection. Requested file action successful (for example, file transfer or file abort)." + "\n";
            }
            break;
        case "RETR":
            if (succes) {
                resultado += "150 " + parametro + "File status okay; about to open data connection." + "\n";
                resultado += "226 " + parametro + "Closing data connection. Requested file action successful (for example, file transfer or file abort)." + "\n";
            }
            else {
                resultado += "426 " + parametro + "Connection closed; transfer aborted." + "\n";
            }
            break;
        case "STOR":
            if (succes) {

                resultado += "150 " + parametro + "File status okay; about to open data connection." + "\n";
                resultado += "226 " + parametro + "Closing data connection. Requested file action successful (for example, file transfer or file abort)." + "\n";

            } else {
                resultado += "426 " + parametro + "Connection closed; transfer aborted." + "\n";
            }

            break;
        default:
            resultado = "502 " + parametro + " Command not implemented." + "\n";
            break;
    }

    document.getElementById("commands").value += codigo + " " + parametro + "\n";
    document.getElementById("responses").value += resultado;
}
function desconectar() {

    cliente.logado = false;
    document.getElementById("remotos").value = "";

}
function conectar() {
    if (document.getElementById("host").value === servidor.ip) {
        if (servidor.online) {
            document.getElementById("commands").value += "Connected to 172.16.62.36" + "\n";
            request("USER", document.getElementById("user").value);
            if (document.getElementById("pwd").value === "admin") {
                request("PASS", document.getElementById("pwd").value, true);
                cliente.logado = true;
                request("PORT", document.getElementById("host").value);
            }

        }
        else {
            document.getElementById("responses").value += "10060 Cannot connect to remote server." + "\n";
        }

    } else {
        document.getElementById("responses").value += "434 Requested host unavailable" + "\n";

    }
}

var servidor = {online: false
    , arq: ["arquivo remoto 1"],
    ip: "172.16.62.36"

};
function atdesServ() {
    if (servidor.online) {
        servidor.online = false;
        cliente.logado = false;
        document.getElementById("remotos").value = "";
        $('#estadoServidor').html("Servidor Offline");
    }
    else {
        servidor.online = true;
        $('#estadoServidor').html("Servidor Online");
    }
}
var cliente = {
    logado: false,
    arquivos: []

};
function enviarArquivo() {
    if (servidor.online && cliente.logado) {
        if (cliente.logado) {
            var n = document.getElementById("send").value;
            document.getElementById("send").value = "";
            var achou = false;
            var x;
            for (x in cliente.arquivos) {
                if (cliente.arquivos[x] === (n)) {
                    achou = true;
                }
            }

            if (achou) {


                $("#progressTimer").progressTimer({
                    timeLimit: 5,
                    warningThreshold: 0,
                    baseStyle: 'progress-bar-info',
                    warningStyle: 'progress-bar-info',
                    completeStyle: 'progress-bar-success',
                    onFinish: function () {
                        if (servidor.online) {

                            servidor.arq.push(n);

                            listServidor();
                            listCliente();
                            request("STOR", n, true);
                            console.log("I'm done");
                        } else {
                            request("STOR", n, false);
                        }

                    }
                });

            }
            else {
                alert(n + " does not exist");
            }
        }
    } else {
        request();
    }
}
function criarArquivo() {
    var nome = document.getElementById("new").value;
    document.getElementById("new").value = "";
    cliente.arquivos.push(nome);
    listCliente();
}

function receberArquivo() {
    if (servidor.online) {
        if (cliente.logado) {
            var n = document.getElementById("receive").value;
            document.getElementById("receive").value = "";
            var achou = false;
            var x;
            for (x in servidor.arq) {
                if (servidor.arq[x].localeCompare(n)) {
                    achou = true;
                }
            }

            if (achou) {


                $("#progressTimer").progressTimer({
                    timeLimit: 5,
                    warningThreshold: 0,
                    baseStyle: 'progress-bar-info',
                    warningStyle: 'progress-bar-info',
                    completeStyle: 'progress-bar-success',
                    onFinish: function () {
                        if (servidor.online) {
                            cliente.arquivos.push(n);
                            listCliente();
                            request("RETR", n, true);
                            console.log("I'm done");
                        } else {
                            request("RETR", n, false);
                        }

                    }
                });

            }
            else {
                alert(n + " does not exist");
            }
        }
    } else {
        request();
    }
}
function listServidor() {
    request("LIST", "", true);
    var s = "";
    var x;
    for (x in servidor.arq) {
        s += servidor.arq[x] + "\n";
    }

    document.getElementById("remotos").value = s;
}
function listCliente() {

    var x;
    var soma = "";
    for (x in cliente.arquivos) {
        soma += cliente.arquivos[x] + "\n";
    }

    document.getElementById("locais").value
            = soma;
}
var transfer = {
    started: false,
    finished: false,
    start: function () {
        this.started = true;

    }
};