	// fps counter
			var stats = new Stats();
			stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
			document.body.appendChild( stats.dom );
			
			const scene = new THREE.Scene();
			const camera = new THREE.PerspectiveCamera( 90, 1, 0.01, 15000 );
			let light = new THREE.HemisphereLight( 0xccccff, 0x6666ff, 1.3);
			const loader = new THREE.TextureLoader();
			
			
			light.position.set(0, 100, 0)
			scene.add(light);
			scene.fog = new THREE.FogExp2(0xce4993,  0.00014)
			
			camera.position.set( 0, 30, 100);
			
			// renderer
			const renderer = new THREE.WebGLRenderer({antialias: true, autoclear: true });
			renderer.setClearColor(new THREE.Color(0xf7f7ff));
			renderer.setSize( window.innerWidth, window.innerHeight);
			document.body.appendChild( renderer.domElement );
			
			
			renderer.domElement.classList.add("render");
			
			// controls
			let controls = new OrbitControls( camera, renderer.domElement );
			// controls.panSpeed = .65;
			controls.enablePan = false;
			controls.rotateSpeed = .2;
			controls.maxPolarAngle = Math.PI * 0.495;
			controls.target.set( 0, 10, 0 );
			controls.minDistance = 40.0;
			controls.maxDistance = 200.0;
			controls.update();

			/*
			controls.minZoom = .1;
			controls.maxZoom = .2
			controls.minPolarAngle = 0;
			controls.maxPolarAngle = Math.PI/1.75;
			*/
			controls.touches = {
				ONE: THREE.TOUCH.ROTATE,
				TWO: THREE.TOUCH.DOLLY_PAN
			}
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize( window.innerWidth, window.innerHeight );
			// water
			//const waterGeometry = new THREE.PlaneGeometry( 15000, 15000,2 ,2 );
			const waterGeometry = new THREE.CircleGeometry( 6000, 200, 200 );
			
			let water = new THREE.Water(
				waterGeometry,
				{
					textureWidth: 512,
					textureHeight: 512,
					waterNormals: new THREE.TextureLoader().load( './textures/water.png', function ( texture ) {
						texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
					}),
					alpha: 1.0,
					sunDirection: new THREE.Vector3(),
					sunColor: 0xffffff,
					waterColor: 0x001e0f,
					distortionScale: 2,
					flowDirection: new THREE.Vector2( 20, 10 ),
					fog: scene.fog !== undefined
				}
			);

			water.rotation.x = - Math.PI / 2;
			water.position.y = - 5;
			scene.add( water );
			
			
			//
			// skybox
		
			const skyGeo = new THREE.SphereGeometry( 7000, 300, 300 );
			let skyTexture = loader.load( './textures/sky.png' );
			let skyMat = new THREE.MeshBasicMaterial( { map: skyTexture, side: THREE.BackSide } );
			const sky = new THREE.Mesh( skyGeo, skyMat );
			sky.rotation.y = Math.PI*5/6;
			scene.add( sky );
			// 
		
			let sun = new THREE.Vector3();

				const parameters = {
					inclination: 0.5,
					azimuth: .7,
					exposure: 1,
					// mieDirectionalG: 1
				};
				
			
			const pmremGenerator = new THREE.PMREMGenerator( renderer );

				function updateSun() {

					const theta = Math.PI * ( parameters.inclination - 0.5 );
					const phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );

					sun.x = -1.7;
					sun.z = -1;
					// sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
					water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

					scene.environment = pmremGenerator.fromScene( sky ).texture;

				}

			updateSun();
			
			// sphere
			
			// sphere.position.set(50, 50, 0); //
			// vector3 0 0 0 sphere
			let sphereMaterial = new THREE.MeshLambertMaterial();
			let middleGeometry = new THREE.SphereGeometry(100,100,100); //
			let middle = new THREE.Mesh(middleGeometry, sphereMaterial); //
			middle.scale.set(0.01, 0.01, 0.01); //
			scene.add( middle ); //
			middle.position.set(0, 0, 0); //
			// particles
			//const { EffectComposer, RenderPass, BlurPass, KernelSize } = POSTPROCESSING;
			const particles = new THREE.BufferGeometry();
			const vertices = [];
			const vertex = new THREE.Vector3();
			particleTexture = loader.load('./textures/particle.png');
			let particlesMat = new THREE.PointsMaterial({
				map: particleTexture,
				transparent: true,
				color: 0xf8f8ff,
				size: 6.5,
				depthWrite : false
				
			});
			let particleNum = 4000;
			for ( let i = 0; i < particleNum; i++ ){
				vertices.push(
					Math.random() * 2000 - 1000, 
					Math.random()*1000-150,
					Math.random() * 2000 - 1000
				);
				
			}
			particles.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		
			let particleSystem = new THREE.Points( particles, particlesMat );
			particleSystem.sortParticles = true;
			
			scene.add(particleSystem);
			function renderParticles() {

			let positionAttribute = particleSystem.geometry.getAttribute( 'position' );
			let rotationAttribute = particleSystem.geometry.getAttribute( 'rotation' );

			for ( let i = 0; i < positionAttribute.count; i++ ) {

				vertex.fromBufferAttribute( positionAttribute, i );
				
				vertex.x -= 0.01;
				vertex.y -= 1.1;
				vertex.z += 0.05;
				if ( vertex.y < - 100 ) {
					vertex.y = 900;
					vertex.x = Math.random() * 2000 - 1000
					vertex.z = Math.random() * 2000 - 1000
				}
		
				
				positionAttribute.setXYZ( i, vertex.x, vertex.y, vertex.z );
				//rotationAttribute.setXYZ( i, vertex.x, vertex.y, vertex.z );

			}

			positionAttribute.needsUpdate = true;

			}
			// papiez
			const stlLoader = new THREE.STLLoader();
			stlLoader.load( './textures/papiez.stl', function ( geometry ) {

					let papiezMaterial = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200, color: 0xffff00 } );

					if ( geometry.hasColors ) {

						papiezMaterial = new THREE.MeshPhongMaterial( { opacity: geometry.alpha, vertexColors: true} );

					}

					const papiez = new THREE.Mesh( geometry, papiezMaterial );

					papiez.position.set( 0.5, -28.5, 0 );
					papiez.rotation.set( -Math.PI/2, 0, Math.PI  );
					papiez.scale.set( 1, 1, 1 );

					papiez.castShadow = true;
					papiez.receiveShadow = true;

					scene.add( papiez );

			} );
			// render
			renderer.render( scene, camera );
			let radius = 50;
			let pos = 0;
			function animate() {
				requestAnimationFrame( animate );
				renderer.render( scene, camera );
				render();
				renderParticles();
				stats.update();
			}
			animate();

			function render(){
				
				water.material.uniforms[ 'time' ].value += .5/60.0;
				
			}
			
			// resize
			window.addEventListener( 'resize', onWindowResize, false );

			function onWindowResize(){
		
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}