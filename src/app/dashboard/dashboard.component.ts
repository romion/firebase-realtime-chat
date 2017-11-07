import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {UserProfileComponent} from "../user-profile/user-profile.component";

interface Post {
  message: string;
  uid: string;
  date: number;
}

interface User {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {

  messageCol: AngularFirestoreCollection<Post>;
  messages: Observable<Post[]>;

  usersCol: AngularFirestoreCollection<User>;
  users: Observable<User[]>;

  test;

  message: string;
  uid = '';

  constructor(
    private afs: AngularFirestore,
    public auth: AuthService
  ) { }

  ngOnInit() {
    const that = this;
    this.getUid();
    this.messageCol = this.afs.collection('messages', ref => ref.orderBy('date', 'desc').limit(20));
    this.messages = this.messageCol.valueChanges().do(res => {
      res.forEach(function(msg) {
        // FIND USER WITH UID AND GET HIS PHOTO
        that.afs.collection('users').doc(msg.uid).valueChanges().subscribe(user => {
          msg['photoURL'] = user['photoURL'];
          // console.log(msg);
        });
      });
    });
    this.usersCol = this.afs.collection('users');
    this.users = this.usersCol.valueChanges();

    this.test = this.messages.map(function(msg) {
      console.log(msg);
      // return msg.message += 'LOL';
    });
  }

  addMessage() {
    this.afs.collection('messages').add({
      'message': this.message,
      'uid': this.uid,
      'date': new Date()
    });
    this.message = '';
  }

  getUid() {
    this.auth.user.subscribe(val => {
      if (val) {
        this.uid = val.uid;
      } else {
        this.uid = '';
      }
    });
  }

  findUserINfo(uid: string) {
    console.log('get info : ' + uid);
    this.afs.collection('users', ref => ref.where('uid', '==', uid))
      .valueChanges()
      // .map(res => console.log(res));
      .subscribe(res => { return res; });

  }
}
