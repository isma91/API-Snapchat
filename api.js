/*jslint browser: true, node : true*/
/*jslint devel : true*/
/*global $, next*/
var http, url, express, mysql, sha1, multer, bdd, app, salt, option, reponse, inscription, verifInscriptionEmail, array, connexion, verifConnexionEmail, token, photoToken, toutlemonde, tabUserToutLeMonde, userAccount, tabUserToutLeMonde, userChangeInfo, userInfo, addFriend, removeFriend, i, j, emailUser, token, fileNamePhoto, allFriend, k, tabAmis, allSnap, l, emailSender, idReceiver, time, token, fileName;
array = [];
tabUserToutLeMonde = [];
http = require('http');
url = require('url');
express = require('express');
mysql = require('mysql');
sha1 = require('sha1');
multer = require('multer');
/*
localhost,
3306,
root,
,
apisnapchat
*/
bdd = mysql.createConnection({
    host     : "37.187.20.82",
    user     : "isma91",
    port     : 3306,
    password : "*******", //add your own host and password
    database : "apiSnapchat"
});

app = express();

bdd.connect(function (erreur) {
    "use strict";
    if (erreur !== null) {
        console.log('ERROR IN THE BDD : ');
        console.log(erreur);
    }
});

salt = 'wow dat salt is sooooooo good';


/*app.use(function (reponse) {
    "use strict";
    // autorise quelle site a envoyer des donné (ici tout le monde)
    reponse.setHeader('Access-Control-Allow-Origin', '*');
    // quelle type de requete sont autoriser
    reponse.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // OBLIGER SINON PAS DE RECEPTION DE DATA !!
    reponse.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Pour l'API
    reponse.setHeader('Access-Control-Allow-Credentials', true);
    //Pour continuer dnas les autres function
    next();
});*/

app.use(multer({ dest: './api_snapchat/upload/'}));

app.post('/', function (response, next) {
    "use strict";
    reponse = {'error' : 'Vous n\'avez pas ecrit api.php avant les options !!!', 'data': null};
    reponse = JSON.stringify(reponse);
    response.send(reponse);
    next();
});

app.post('/api.js', function (requete, response) {
    "use strict";
    option = requete.query.option;
    console.log(option);
    if (option === 'inscription') {
        requete.on('data', function (dataInscription) {
            inscription = new Buffer(dataInscription);
            inscription = inscription.toString('utf-8');
            inscription = JSON.parse(inscription);
            if (inscription.email.match(/@/)) {
                verifInscriptionEmail = inscription.email.split('@');
                if (verifInscriptionEmail.length === 2) {
                    if (verifInscriptionEmail[1].match(/\./)) {
                        if (verifInscriptionEmail[1].split('.').length === 2) {
                            if (inscription.password.length > 5) {
                                inscription.password = sha1(inscription.password + salt);
                                bdd.query('SELECT email FROM user WHERE email = ?', inscription.email, function (resultat) {
                                    if (resultat.length === 0) {
                                        bdd.query("INSERT INTO user SET ?", inscription, function (error) {
                                            if (error !== null) {
                                                reponse = {'error': 'Il y a eu une erreur durant l\'ajout de vos identifiant dans notre bdd, veuillez re-essayer, si ca persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                                                reponse = JSON.stringify(reponse);
                                                response.send(reponse);
                                            } else {
                                                array = [];
                                                reponse = {'error': false, 'data': array, 'token': null};
                                                reponse = JSON.stringify(reponse);
                                                response.send(reponse);
                                            }
                                        });
                                    } else {
                                        reponse = {'error': 'Email deja pris !!!', 'data': array, 'token': null};
                                        reponse = JSON.stringify(reponse);
                                        response.send(reponse);
                                    }
                                });
                            } else {
                                reponse = {'error': 'Votre password est inferieur a 5 caracteres !!!', 'data': array, 'token': null};
                                reponse = JSON.stringify(reponse);
                                response.send(reponse);
                            }
                        } else {
                            reponse = {'error': 'Il y a plus d\'un point "." dans votre email !!!', 'data': array, 'token': null};
                            reponse = JSON.stringify(reponse);
                            response.send(reponse);
                        }
                    } else {
                        reponse = {'error': 'Il n\'y a pas de point "." dans votre email !!!', 'data': array, 'token': null};
                        reponse = JSON.stringify(reponse);
                        response.send(reponse);
                    }
                } else {
                    reponse = {'error': 'Il y a plus d\'un arobase "@" dans votre email !!!', 'data': array, 'token': null};
                    reponse = JSON.stringify(reponse);
                    response.send(reponse);
                }
            } else {
                reponse = {'error': 'Il n\'y a pas d\'arobase "@" dans votre email !!!', 'data': array, 'token': null};
                reponse = JSON.stringify(reponse);
                response.send(reponse);
            }
        });
    } else if (option === 'connexion') {
        requete.on('data', function (dataConnexion) {
            connexion = new Buffer(dataConnexion);
            connexion = connexion.toString('utf-8');
            connexion = JSON.parse(connexion);
            if (connexion.email.match(/@/)) {
                verifConnexionEmail = connexion.email.split('@');
                if (verifConnexionEmail.length === 2) {
                    if (verifConnexionEmail[1].match(/\./)) {
                        if (verifConnexionEmail[1].split('.').length === 2) {
                            if (connexion.password.length > 5) {
                                bdd.query("SELECT * FROM user WHERE email = '" + connexion.email + "'", function (error, results) {
                                    if (error === null) {
                                        connexion.password = sha1(connexion.password + salt);
                                        if (connexion.password === results[0].password) {
                                            token = sha1((Math.random() * 100) + salt);
                                            array = [{'id': results[0].id, 'username': results[0].email}];
                                            bdd.query("UPDATE user SET token = '" + token + "' WHERE email = '" + connexion.email + "'", function () {
                                                reponse = {'error': false, 'data': array, 'token': token};
                                                reponse = JSON.stringify(reponse);
                                                response.send(reponse);
                                            });
                                        } else {
                                            reponse = {'error': 'Bon email mais mauvais mot de passe !!!', 'data': array, 'token': null};
                                            reponse = JSON.stringify(reponse);
                                            response.send(reponse);
                                        }
                                    } else {
                                        reponse = {'error': 'Il y a eu une erreur durant la connexion de vos identifiant dans notre bdd, veuillez re-essayer, si ca persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                                        reponse = JSON.stringify(reponse);
                                        response.send(reponse);
                                    }
                                });
                            } else {
                                reponse = {'error': 'Votre password est inferieur a 5 caracteres !!!', 'data': array, 'token': null};
                                reponse = JSON.stringify(reponse);
                                response.send(reponse);
                            }
                        } else {
                            reponse = {'error': 'Il y a plus d\'un point "." dans votre email !!!', 'data': array, 'token': null};
                            reponse = JSON.stringify(reponse);
                            response.send(reponse);
                        }
                    } else {
                        reponse = {'error': 'Il n\'y a pas de point "." dans votre email !!!', 'data': array, 'token': null};
                        reponse = JSON.stringify(reponse);
                        response.send(reponse);
                    }
                } else {
                    reponse = {'error': 'Il y a plus d\'un arobase "@" dans votre email !!!', 'data': array, 'token': null};
                    reponse = JSON.stringify(reponse);
                    response.send(reponse);
                }
            } else {
                reponse = {'error': 'Il n\'y a pas d\'arobase "@" dans votre email !!!', 'data': array, 'token': null};
                reponse = JSON.stringify(reponse);
                response.send(reponse);
            }
        });
    } else if (option === 'toutlemonde') {
        requete.on('data', function (dataToutlemonde) {
            var i;
            toutlemonde = new Buffer(dataToutlemonde);
            toutlemonde = toutlemonde.toString('utf-8');
            toutlemonde = JSON.parse(toutlemonde);
            bdd.query("SELECT email, token FROM user WHERE email = '" + toutlemonde.email + "' AND token = '" + toutlemonde.token + "'", function (erreur, results) {
                if (erreur === null) {
                    if (results.length !== 0) {
                        bdd.query("SELECT id, email FROM user", function (error, resultats) {
                            if (error === null) {
                                for (i = 0; i < resultats.length; i = i + 1) {
                                    tabUserToutLeMonde.push({id: resultats[i].id, username: resultats[i].email});
                                }
                                reponse = {'error': false, 'data': tabUserToutLeMonde, 'token': null};
                                reponse = JSON.stringify(reponse);
                                response.send(reponse);
                            } else {
                                reponse = {'error': 'Il n\'y a eu une erreur durant l\'envoie de tout les contacts, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                                reponse = JSON.stringify(reponse);
                                response.send(reponse);
                            }
                        });
                    } else {
                        reponse = {'error': 'Vous n\'avez pas envoyer votre email et votre token pour recevoir tout les contacts !!!', 'data': array, 'token': null};
                        reponse = JSON.stringify(reponse);
                        response.send(reponse);
                    }
                } else {
                    reponse = {'error': 'Il n\'y a eu une erreur durant la reception de vos identifiant pour afficher tout les contacts, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                    reponse = JSON.stringify(reponse);
                    response.send(reponse);
                }
            });
        });
    } else if (option === 'image') {
        emailSender = requete.body.email;
        idReceiver = requete.body.u2;
        time = requete.body.temps;
        token = requete.body.token;
        fileName = requete.files.file.name;
        if (requete.files.file.fieldname === 'file') {
            if (requete.files.file.mimetype === 'image/jpeg') {
                bdd.query('SELECT email FROM user WHERE email = "' + emailSender +  '"', function (erreur, results) {
                    if (erreur === null) {
                        if (results.length !== 0) {
                            bdd.query('SELECT id FROM user WHERE id = ' + idReceiver, function (error, resultat) {
                                if (error === null) {
                                    if (resultat.length !== 0) {
                                        bdd.query('SELECT token FROM user WHERE token = "' + token + '"', function (erreurs, resultats) {
                                            if (erreurs === null) {
                                                if (resultats.length !== 0) {
                                                    if (time < 11 && time > 0) {
                                                        bdd.query('INSERT INTO snap (sendEmail, receivId, time, fileName) VALUES ("' + emailSender + '", "' + idReceiver + '", "' + time + '", "' + fileName + '")', function (errors) {
                                                            if (errors === null) {
                                                                array = [];
                                                                reponse = {'error': false, 'data': array, 'token': null};
                                                                reponse = JSON.stringify(reponse);
                                                                response.send(reponse);
                                                            } else {
                                                                reponse = {'error': 'Il n\'y a eu une erreur durant l\'ajout du snap , si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                                                                reponse = JSON.stringify(reponse);
                                                                response.send(reponse);
                                                            }
                                                        });
                                                    } else {
                                                        reponse = {'error': 'Le temps du snap doit etre entre 1 et 10 secondes !!!', 'data': array, 'token': null};
                                                        reponse = JSON.stringify(reponse);
                                                        response.send(reponse);
                                                    }
                                                } else {
                                                    reponse = {'error': 'Mauvais token !!!', 'data': array, 'token': null};
                                                    reponse = JSON.stringify(reponse);
                                                    response.send(reponse);
                                                }
                                            } else {
                                                reponse = {'error': 'Il n\'y a eu une erreur durant la verification de votre token pour l\'envoie de snap, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                                                reponse = JSON.stringify(reponse);
                                                response.send(reponse);
                                            }
                                        });
                                    } else {
                                        reponse = {'error': 'Mauvais id !!!', 'data': array, 'token': null};
                                        reponse = JSON.stringify(reponse);
                                        response.send(reponse);
                                    }
                                } else {
                                    reponse = {'error': 'Il n\'y a eu une erreur durant la verification de l\'id pour l\'envoie de snap, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                                    reponse = JSON.stringify(reponse);
                                    response.send(reponse);
                                }
                            });
                        } else {
                            reponse = {'error': 'Mauvais email !!!', 'data': array, 'token': null};
                            reponse = JSON.stringify(reponse);
                            response.send(reponse);
                        }
                    } else {
                        reponse = {'error': 'Il n\'y a eu une erreur durant la verification de votre email pour l\'envoie de snap, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                        reponse = JSON.stringify(reponse);
                        response.send(reponse);
                    }
                });
            } else {
                reponse = {'error': 'Vous n\'avez pas envoyer une image jpeg !!!', 'data': array, 'token': null};
                reponse = JSON.stringify(reponse);
                response.send(reponse);
            }
        } else {
            reponse = {'error': 'Vous n\'avez pas envoyer un fichier !!!', 'data': array, 'token': null};
            reponse = JSON.stringify(reponse);
            response.send(reponse);
        }
    } else if (option === 'changePass') {
        requete.on('data', function (dataPass) {
            var actuelPass, nouveauPass;
            userAccount = new Buffer(dataPass);
            userAccount = userAccount.toString('utf-8');
            userAccount = JSON.parse(userAccount);
            actuelPass = sha1(userAccount.actuelPass + salt);
            bdd.query('SELECT * FROM user WHERE email = "' + userAccount.email + '"', function (erreur, results) {
                if (erreur === null) {
                    if (results.length === 0) {
                        reponse = {'error': 'Cette email n\'est pas dans notre bdd !!! Vous avez mal ecrit votre email !!!', 'data': array, 'token': null};
                        reponse = JSON.stringify(reponse);
                        response.send(reponse);
                    } else {
                        if (userAccount.token === results[0].token) {
                            if (actuelPass === results[0].password) {
                                if (userAccount.newPass.length >= 5) {
                                    nouveauPass = sha1(userAccount.newPass + salt);
                                    bdd.query("UPDATE user SET password = '" + nouveauPass + "' WHERE email = '" + userAccount.email + "'", function (erreur) {
                                        if (erreur === null) {
                                            array = [];
                                            reponse = {'error': false, 'data': array, 'token': null};
                                            reponse = JSON.stringify(reponse);
                                            response.send(reponse);
                                        } else {
                                            reponse = {'error': 'Il n\'y a eu une erreur durant le changement de votre pass , si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                                            reponse = JSON.stringify(reponse);
                                            response.send(reponse);
                                        }
                                    });
                                } else {
                                    reponse = {'error': 'Votre nouveau pass doit avoir au moins 5 caracteres !!!', 'data': array, 'token': null};
                                    reponse = JSON.stringify(reponse);
                                    response.send(reponse);
                                }
                            } else {
                                reponse = {'error': 'Vous n\'avez pas bien ecrit votre pass actuel !!!', 'data': array, 'token': null};
                                reponse = JSON.stringify(reponse);
                                response.send(reponse);
                            }
                        } else {
                            reponse = {'error': 'Vous n\'avez pas bien ecrit votre token !!!', 'data': array, 'token': null};
                            reponse = JSON.stringify(reponse);
                            response.send(reponse);
                        }
                    }
                } else {
                    reponse = {'error': 'Il n\'y a eu une erreur durant l\'envoie de vos coordonne pour changer votre pass, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                    reponse = JSON.stringify(reponse);
                    response.send(reponse);
                }
            });
        });
    } else if (option === 'changeInfoUser') {
        requete.on('data', function (dataChangeInfo) {
            userChangeInfo = new Buffer(dataChangeInfo);
            userChangeInfo = userChangeInfo.toString('utf-8');
            userChangeInfo = JSON.parse(userChangeInfo);
            bdd.query('SELECT * FROM user WHERE email = "' + userChangeInfo.email + '"', function (erreur, results) {
                if (erreur === null) {
                    if (results.length === 0) {
                        reponse = {'error': 'Cette email n\'est pas dans notre bdd !!! Vous avez mal ecrit votre email !!!', 'data': array, 'token': null};
                        reponse = JSON.stringify(reponse);
                        response.send(reponse);
                    } else {
                        if (userChangeInfo.token === results[0].token) {
                            if (userChangeInfo.nom.length > 1) {
                                if (userChangeInfo.prenom.length > 1) {
                                    bdd.query('UPDATE user SET nom = "' + userChangeInfo.nom + '", prenom = "' + userChangeInfo.prenom + '" WHERE email = "' + userChangeInfo.email + '"', function (erreur) {
                                        if (erreur === null) {
                                            array = [];
                                            reponse = {'error': false, 'data': array, 'token': null};
                                            reponse = JSON.stringify(reponse);
                                            response.send(reponse);
                                        } else {
                                            reponse = {'error': 'Il n\'y a eu une erreur durant le changement de vos identité , si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                                            reponse = JSON.stringify(reponse);
                                            response.send(reponse);
                                        }
                                    });
                                } else {
                                    reponse = {'error': 'Votre prenom est vide !!!', 'data': array, 'token': null};
                                    reponse = JSON.stringify(reponse);
                                    response.send(reponse);
                                }
                            } else {
                                reponse = {'error': 'Votre nom est vide !!!', 'data': array, 'token': null};
                                reponse = JSON.stringify(reponse);
                                response.send(reponse);
                            }
                        } else {
                            reponse = {'error': 'Vous n\'avez pas bien ecrit votre token !!!', 'data': array, 'token': null};
                            reponse = JSON.stringify(reponse);
                            response.send(reponse);
                        }
                    }
                } else {
                    reponse = {'error': 'Il n\'y a eu une erreur durant l\'envoie de vos informations pour changer vos identité, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                    reponse = JSON.stringify(reponse);
                    response.send(reponse);
                }
            });
        });
    } else if (option === 'userInfo') {
        requete.on('data', function (dataInfoUser) {
            userInfo = new Buffer(dataInfoUser);
            userInfo = userInfo.toString('utf-8');
            userInfo = JSON.parse(userInfo);
            bdd.query('SELECT * FROM user WHERE email = "' + userInfo.email + '"', function (erreur, results) {
                if (erreur === null) {
                    if (results.length === 0) {
                        reponse = {'error': 'Cette email n\'est pas dans notre bdd !!! Vous avez mal ecrit votre email !!!', 'data': array, 'token': null};
                        reponse = JSON.stringify(reponse);
                        response.send(reponse);
                    } else {
                        if (userInfo.token === results[0].token) {
                            array = [{email: results[0].email, nom: results[0].nom, prenom: results[0].prenom, photo: results[0].photo}];
                            reponse = {'error': false, 'data': array, 'token': null};
                            reponse = JSON.stringify(reponse);
                            response.send(reponse);
                        } else {
                            reponse = {'error': 'Vous n\'avez pas bien ecrit votre token !!!', 'data': array, 'token': null};
                            reponse = JSON.stringify(reponse);
                            response.send(reponse);
                        }
                    }
                } else {
                    reponse = {'error': 'Il n\'y a eu une erreur durant l\'envoie de vos informations, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                    reponse = JSON.stringify(reponse);
                    response.send(reponse);
                }
            });
        });
    } else if (option === 'photoProfil') {
        emailUser = requete.body.email;
        photoToken = requete.body.token;
        fileNamePhoto = requete.files.file.name;
        if (requete.files.file.fieldname === 'file') {
            if (requete.files.file.mimetype === 'image/jpeg') {
                bdd.query('SELECT email FROM user WHERE email = "' + emailUser +  '"', function (erreur, results) {
                    if (erreur === null) {
                        if (results.length !== 0) {
                            bdd.query('SELECT token FROM user WHERE token = "' + photoToken + '"', function (erreurs, resultats) {
                                if (erreurs === null) {
                                    if (resultats.length !== 0) {
                                        bdd.query('UPDATE user SET photo = "' + fileNamePhoto + '" WHERE email = "' + emailUser + '"', function (errors) {
                                            if (errors === null) {
                                                array = [];
                                                reponse = {'error': false, 'data': array, 'token': null};
                                                reponse = JSON.stringify(reponse);
                                                response.send(reponse);
                                            } else {
                                                reponse = {'error': 'Il n\'y a eu une erreur durant l\'ajout de votre photo de profil , si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                                                reponse = JSON.stringify(reponse);
                                                response.send(reponse);
                                            }
                                        });
                                    } else {
                                        reponse = {'error': 'Mauvais token !!!', 'data': array, 'token': null};
                                        reponse = JSON.stringify(reponse);
                                        response.send(reponse);
                                    }
                                } else {
                                    reponse = {'error': 'Il n\'y a eu une erreur durant la verification de votre token pour l\'envoie de la photo de profil, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                                    reponse = JSON.stringify(reponse);
                                    response.send(reponse);
                                }
                            });
                        } else {
                            reponse = {'error': 'Mauvais email !!!', 'data': array, 'token': null};
                            reponse = JSON.stringify(reponse);
                            response.send(reponse);
                        }
                    } else {
                        reponse = {'error': 'Il n\'y a eu une erreur durant la verification de votre email pour l\'envoie de la photo de profil, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                        reponse = JSON.stringify(reponse);
                        response.send(reponse);
                    }
                });
            } else {
                reponse = {'error': 'Vous n\'avez pas envoyer une image jpeg !!!', 'data': array, 'token': null};
                reponse = JSON.stringify(reponse);
                response.send(reponse);
            }
        } else {
            reponse = {'error': 'Vous n\'avez pas envoyer un fichier !!!', 'data': array, 'token': null};
            reponse = JSON.stringify(reponse);
            response.send(reponse);
        }
    } else if (option === 'addFriend') {
        requete.on('data', function (dataAddFriend) {
            addFriend = new Buffer(dataAddFriend);
            addFriend = addFriend.toString('utf-8');
            addFriend = JSON.parse(addFriend);
            bdd.query('SELECT * FROM user WHERE email = "' + addFriend.email + '"', function (erreur, results) {
                if (erreur === null) {
                    if (results.length === 0) {
                        reponse = {'error': 'Cette email n\'est pas dans notre bdd !!! Vous avez mal ecrit votre email !!!', 'data': array, 'token': null};
                        reponse = JSON.stringify(reponse);
                        response.send(reponse);
                    } else {
                        if (addFriend.token === results[0].token) {
                            bdd.query('INSERT INTO amis (idSendeur, emailReceveur, reponse) VALUES (' + results[0].id + ', "' + addFriend.friend + '", 0)', function (error) {
                                if (error === null) {
                                    array = [];
                                    reponse = {'error': false, 'data': array, 'token': null};
                                    reponse = JSON.stringify(reponse);
                                    response.send(reponse);
                                } else {
                                    reponse = {'error': 'Il n\'y a eu une erreur durant l\'ajout de la demande d\'ami, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                                    reponse = JSON.stringify(reponse);
                                    response.send(reponse);
                                }
                            });
                        } else {
                            reponse = {'error': 'Vous n\'avez pas bien ecrit votre token !!!', 'data': array, 'token': null};
                            reponse = JSON.stringify(reponse);
                            response.send(reponse);
                        }
                    }
                } else {
                    reponse = {'error': 'Il n\'y a eu une erreur durant l\'envoie de vos informations, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                    reponse = JSON.stringify(reponse);
                    response.send(reponse);
                }
            });
        });
    } else if (option === 'removeFriend') {
        requete.on('data', function (dataRemoveFriend) {
            removeFriend = new Buffer(dataRemoveFriend);
            removeFriend = removeFriend.toString('utf-8');
            removeFriend = JSON.parse(removeFriend);
            bdd.query('SELECT * FROM user WHERE email = "' + removeFriend.email + '"', function (erreur, results) {
                if (erreur === null) {
                    if (results.length === 0) {
                        reponse = {'error': 'Cette email n\'est pas dans notre bdd !!! Vous avez mal ecrit votre email !!!', 'data': array, 'token': null};
                        reponse = JSON.stringify(reponse);
                        response.send(reponse);
                    } else {
                        if (removeFriend.token === results[0].token) {
                            bdd.query('SELECT id FROM user WHERE email = "' + removeFriend.friend + '"', function (erreurs, resultat) {
                                if (erreurs === null) {
                                    bdd.query('DELETE FROM amis WHERE idSendeur = ' + resultat[0].id + ' AND emailReceveur = "' + results[0].email + '"', function (error) {
                                        if (error === null) {
                                            array = [];
                                            reponse = {'error': false, 'data': array, 'token': null};
                                            reponse = JSON.stringify(reponse);
                                            response.send(reponse);
                                        } else {
                                            reponse = {'error': 'Il n\'y a eu une erreur durant la suppression de l\'ami, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                                            reponse = JSON.stringify(reponse);
                                            response.send(reponse);
                                        }
                                    });
                                } else {
                                    reponse = {'error': 'Il n\'y a eu une erreur durant la reception de vos informations, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                                    reponse = JSON.stringify(reponse);
                                    response.send(reponse);
                                }
                            });
                        } else {
                            reponse = {'error': 'Vous n\'avez pas bien ecrit votre token !!!', 'data': array, 'token': null};
                            reponse = JSON.stringify(reponse);
                            response.send(reponse);
                        }
                    }
                } else {
                    reponse = {'error': 'Il n\'y a eu une erreur durant l\'envoie de vos informations, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                    reponse = JSON.stringify(reponse);
                    response.send(reponse);
                }
            });
        });
    } else if (option === 'receptionFriend') {
        requete.on('data', function (dataFriend) {
            allFriend = new Buffer(dataFriend);
            allFriend = allFriend.toString('utf-8');
            allFriend = JSON.parse(allFriend);
            bdd.query('SELECT * FROM user WHERE email = "' + allFriend.email + '"', function (erreur, results) {
                if (erreur === null) {
                    if (results.length === 0) {
                        reponse = {'error': 'Cette email n\'est pas dans notre bdd !!! Vous avez mal ecrit votre email !!!', 'data': array, 'token': null};
                        reponse = JSON.stringify(reponse);
                        response.send(reponse);
                    } else {
                        if (allFriend.token === results[0].token) {
                            bdd.query('SELECT amis.idSendeur, user.email, user.nom, user.prenom, user.photo FROM amis INNER JOIN user ON user.id = amis.idSendeur  WHERE emailReceveur = "' + allFriend.email + '"', function (erreurs, resultat) {
                                tabAmis = [];
                                if (erreurs === null) {
                                    for (k = 0; k < resultat.length; k = k + 1) {
                                        tabAmis.push({id: resultat[k].idSendeur, email: resultat[k].email, nom: resultat[k].nom, prenom: resultat[k].prenom, photo: resultat[k].photo});
                                    }
                                    reponse = {'error': false, 'data': tabAmis, 'token': null};
                                    reponse = JSON.stringify(reponse);
                                    response.send(reponse);
                                } else {
                                    reponse = {'error': 'Il n\'y a eu une erreur durant la reception de vos informations, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                                    reponse = JSON.stringify(reponse);
                                    response.send(reponse);
                                }
                            });
                        } else {
                            reponse = {'error': 'Vous n\'avez pas bien ecrit votre token !!!', 'data': array, 'token': null};
                            reponse = JSON.stringify(reponse);
                            response.send(reponse);
                        }
                    }
                } else {
                    reponse = {'error': 'Il n\'y a eu une erreur durant l\'envoie de vos informations, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                    reponse = JSON.stringify(reponse);
                    response.send(reponse);
                }
            });
        });
    } else if (option === 'newsnap') {
        requete.on('data', function (dataSnap) {
            allSnap = new Buffer(dataSnap);
            allSnap = allSnap.toString('utf-8');
            allSnap = JSON.parse(allSnap);
            bdd.query('SELECT * FROM user WHERE email = "' + allSnap.email + '"', function (erreur, results) {
                if (erreur === null) {
                    if (results.length === 0) {
                        reponse = {'error': 'Cette email n\'est pas dans notre bdd !!! Vous avez mal ecrit votre email !!!', 'data': array, 'token': null};
                        reponse = JSON.stringify(reponse);
                        response.send(reponse);
                    } else {
                        if (allSnap.token === results[0].token) {
                            bdd.query('SELECT snap.id AS "snapID", snap.sendEmail, snap.receivId, snap.time, snap.fileName, user.id AS "userId", user.email, user.nom, user.prenom, user.photo FROM snap INNER JOIN user ON user.email = snap.sendEmail WHERE snap.receivId = ' + results[0].id + ' AND snap.vu = 0', function (error, resultat) {
                                if (error === null) {
                                    array = [];
                                    for (l = 0; l < resultat.length; l = l + 1) {
                                        array.push({idSnap: resultat[l].snapID, envoyeurEmail: resultat[l].sendEmail, idReceiver: resultat[l].receivId, temps: resultat[l].time, snap: resultat[l].fileName, email: resultat[l].email, nom: resultat[l].nom, prenom: resultat[l].prenom, photo: resultat[l].photo});
                                    }
                                    reponse = {'error': false, 'data': array, 'token': null};
                                    reponse = JSON.stringify(reponse);
                                    response.send(reponse);
                                } else {
                                    reponse = {'error': 'Il n\'y a eu une erreur durant la reception de snap, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                                    reponse = JSON.stringify(reponse);
                                    response.send(reponse);
                                }
                            });
                        } else {
                            reponse = {'error': 'Vous n\'avez pas bien ecrit votre token !!!', 'data': array, 'token': null};
                            reponse = JSON.stringify(reponse);
                            response.send(reponse);
                        }
                    }
                } else {
                    reponse = {'error': 'Il n\'y a eu une erreur durant l\'envoie de vos informations, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                    reponse = JSON.stringify(reponse);
                    response.send(reponse);
                }
            });
        });
    } else if (option === 'vu') {
        requete.on('data', function (dataSnapVu) {
            var theSnap;
            theSnap = new Buffer(dataSnapVu);
            theSnap = theSnap.toString('utf-8');
            theSnap = JSON.parse(theSnap);
            bdd.query('SELECT * FROM user WHERE email = "' + theSnap.email + '"', function (erreur, results) {
                if (erreur === null) {
                    if (results.length === 0) {
                        reponse = {'error': 'Cette email n\'est pas dans notre bdd !!! Vous avez mal ecrit votre email !!!', 'data': array, 'token': null};
                        reponse = JSON.stringify(reponse);
                        response.send(reponse);
                    } else {
                        if (theSnap.token === results[0].token) {
                            bdd.query('UPDATE snap SET vu = 1 WHERE id = ' + theSnap.id, function (error) {
                                if (error === null) {
                                    array = [];
                                    reponse = {'error': false, 'data': array, 'token': null};
                                    reponse = JSON.stringify(reponse);
                                    response.send(reponse);
                                } else {
                                    reponse = {'error': 'Il n\'y a eu une erreur durant la vu du snap, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                                    reponse = JSON.stringify(reponse);
                                    response.send(reponse);
                                }
                            });
                        } else {
                            reponse = {'error': 'Vous n\'avez pas bien ecrit votre token !!!', 'data': array, 'token': null};
                            reponse = JSON.stringify(reponse);
                            response.send(reponse);
                        }
                    }
                } else {
                    reponse = {'error': 'Il n\'y a eu une erreur durant l\'envoie de vos informations, si l\'erreur persiste, veuillez appeller le reponsable technique de cette API', 'data': array, 'token': null};
                    reponse = JSON.stringify(reponse);
                    response.send(reponse);
                }
            });
        });
    } else {
        reponse = {'error': 'Vous n\'avez pas ecrit une option valide !!! Option valide : inscription, connexion, toutlemonde, image, newsnap, vu, changePass, changeInfoUser, userInfo, photoProfil, addFriend, removeFriend, receptionFriend', 'data': null};
        reponse = JSON.stringify(reponse);
        response.send(reponse);
    }
});

app.listen(3000);