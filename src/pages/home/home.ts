import { Component,OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { Http } from "@angular/http";

import { SMS } from "@ionic-native/sms";
import { AndroidPermissions } from '@ionic-native/android-permissions';

interface message{
  id:any,
  number:string,
  message:string,
  status:string
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage implements OnInit {
  isAllowed:boolean=false;
  messages:Array<message>=[
    {
      id:1,
      number:"03471664582",
      message:"hello world",
      status:"pending"
    }
  ];
  ngOnInit(){
    this.getPendingSMS();
  }
  getPendingSMS(){
    this.http.get("http://192.168.10.6:8000/api/sms").subscribe(res=>{
      console.log(res.json());
      this.messages=res.json();
      console.log("messages updated")
    },(error)=>{
      console.log("error");
      console.log(error);
    })
  }
  sendSms(){
    this.messages.forEach(message => {
      this.sms.send(message.number,message.message).then(()=>{
        // alert("message sent");
        console.log("message sent");
        this.http.put("http://192.168.10.6:8000/api/sms/"+message.id,{"status":"sent"}).subscribe(response=>{
          // console.log(response);
          message.status="sent";
          console.log("response recieved");
          this.getPendingSMS();
        });
      }).catch(()=>{
        alert("error message not sent");
      })
    });
    
  }
  constructor(private http:Http,private platform: Platform,public navCtrl: NavController,private sms:SMS,private androidPermissions: AndroidPermissions) {
    this.platform.ready().then(()=>{
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.SEND_SMS).then(
        result => {
          console.log('Has permission?',result.hasPermission);
          if (!result.hasPermission){
            this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.SEND_SMS);
            location.reload();
          }
          
        }
        
      );
      this.sms.hasPermission().then(response=>{
        console.log(response);
        this.isAllowed=response
  
      })
    })
  }

}
