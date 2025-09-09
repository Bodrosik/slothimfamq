// threeParallax.js
// Викликається як: new ThreeParallax(document.getElementById('three-canvas'))
(function(global){
  class ThreeParallax {
    constructor(canvas){
      this.canvas = canvas;
      this.init();
    }
    init(){
      this.renderer = new THREE.WebGLRenderer({canvas:this.canvas, antialias:true, alpha:true});
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.onResize();
      window.addEventListener('resize', ()=>this.onResize());

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(50, this.w/this.h, 0.1, 2000);
      this.camera.position.set(0,0,300);

      const amb = new THREE.AmbientLight(0xffffff, 0.8); this.scene.add(amb);
      const dir = new THREE.DirectionalLight(0xffffff, 0.4); dir.position.set(0.5,1,0.3); this.scene.add(dir);

      this.group = new THREE.Group(); this.scene.add(this.group);

      const geom = new THREE.BoxGeometry(40,40,40);
      for(let i=0;i<14;i++){
        const mat = new THREE.MeshStandardMaterial({color:0x224466,transparent:true,opacity:0.12,roughness:0.8});
        const m = new THREE.Mesh(geom,mat);
        m.position.set((Math.random()-0.5)*800,(Math.random()-0.5)*300,(Math.random()-0.5)*800);
        m.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,0);
        const s = 0.6 + Math.random()*1.6;
        m.scale.set(s,s,s);
        this.group.add(m);
      }

      this.mouseX = 0; this.mouseY = 0;
      document.addEventListener('mousemove', e=>{
        const w = window.innerWidth, h = window.innerHeight;
        this.mouseX = (e.clientX - w/2)/w*2;
        this.mouseY = (e.clientY - h/2)/h*2;
      });

      this.time = 0;
      this.raf();
    }
    onResize(){
      this.w = this.canvas.clientWidth || window.innerWidth;
      this.h = this.canvas.clientHeight || Math.max(window.innerHeight*0.6, 480);
      this.renderer.setSize(this.w, this.h);
      if(this.camera) { this.camera.aspect = this.w / this.h; this.camera.updateProjectionMatrix(); }
    }
    raf(){
      this.time += 0.01;
      this.group.rotation.y += 0.002 + (this.mouseX * 0.002);
      this.group.rotation.x += 0.001 * this.mouseY;
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(()=>this.raf());
    }
  }

  // Expose to global
  global.ThreeParallax = ThreeParallax;
})(window);
