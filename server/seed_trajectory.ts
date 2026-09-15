import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  const plate = 'MH12AB1234';
  
  // 1. Get cameras
  const cameras = await prisma.cameras.findMany();
  if (cameras.length === 0) {
    console.log('No cameras found. Please seed cameras first.');
    return;
  }

  // 2. Select a subset of cameras for the trajectory
  const trajectoryCameras = cameras.slice(0, 5);
  
  console.log(`Seeding detections for plate ${plate} across ${trajectoryCameras.length} cameras...`);

  // 3. Create detections sequentially
  let currentTime = new Date(Date.now() - 1000 * 60 * 60); // Start 1 hour ago
  
  for (let i = 0; i < trajectoryCameras.length; i++) {
    const camera = trajectoryCameras[i];
    
    await prisma.detections.create({
      data: {
        plate,
        camera_id: camera.id,
        edge_node_id: camera.edge_node_id,
        vehicle_type: 'Sedan',
        vehicle_color: 'Silver',
        confidence: 0.95 + (Math.random() * 0.04),
        latitude: camera.latitude,
        longitude: camera.longitude,
        timestamp: new Date(currentTime),
        metadata_size_bytes: 4096,
        raw_video_bytes: 0
      }
    });
    
    console.log(`Inserted detection at camera ${camera.name} (${camera.id}) at ${currentTime.toISOString()}`);
    
    // Increment time by 5-15 minutes for the next detection
    currentTime = new Date(currentTime.getTime() + (5 + Math.random() * 10) * 60 * 1000);
  }

  console.log('Seeding complete.');
}

seed()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
