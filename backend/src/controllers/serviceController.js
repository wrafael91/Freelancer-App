const Service = require('../models/Service');

// Modificar getServices para manejar el filtro por userId
exports.getServices = async (req, res) => {
  try {
    const query = {};
    
    // Si hay un userId en la query, filtrar por ese freelancer
    if (req.query.userId) {
      query.freelancer = req.query.userId;
    }

    const services = await Service.find(query)
      .populate('freelancer', 'name avatar')
      .sort({ createdAt: -1 });
    
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// Añadir el nuevo controlador para obtener servicios propios
exports.getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ freelancer: req.user.id })
      .populate('freelancer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// Obtener un servicio por ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('freelancer', 'name avatar');

    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    res.json(service);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
};

// Crear un nuevo servicio
exports.createService = async (req, res) => {
  try {
    const { title, description, category, price } = req.body;

    const newService = new Service({
      title,
      description,
      category,
      price,
      freelancer: req.user.id // ID del usuario autenticado
    });

    const service = await newService.save();
    res.status(201).json(service);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// Actualizar un servicio
exports.updateService = async (req, res) => {
  try {

    console.log('==== Creación de Servicio ====');
    console.log('Token recibido:', req.header('Authorization'));
    console.log('Usuario autenticado:', {
      id: req.user.id,
      name: req.user.name
    });
    
    const { title, description, category, price } = req.body;

    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    // Verifica si el usuario es el dueño del servicio
    if (service.freelancer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    service.title = title || service.title;
    service.description = description || service.description;
    service.category = category || service.category;
    service.price = price || service.price;

    await service.save();

    res.json(service);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
};

// Eliminar un servicio
exports.deleteService = async (req, res) => {
  try {
    console.log('==== Eliminando Servicio ====');
    console.log('ID del servicio:', req.params.id);
    console.log('Usuario autenticado:', req.user);

    const service = await Service.findById(req.params.id);
    
    if (!service) {
      console.log('Servicio no encontrado');
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    console.log('Servicio encontrado:', service);
    console.log('ID del freelancer del servicio:', service.freelancer);
    console.log('ID del usuario que intenta eliminar:', req.user.id);

    // Verifica si el usuario es el dueño del servicio
    if (service.freelancer.toString() !== req.user.id) {
      console.log('Usuario no autorizado para eliminar este servicio');
      return res.status(401).json({ message: 'No autorizado para eliminar este servicio' });
    }

    await Service.deleteOne({ _id: req.params.id });
    console.log('Servicio eliminado exitosamente');
    
    res.json({ message: 'Servicio eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar servicio:', err);
    res.status(500).json({ message: 'Error al eliminar el servicio', error: err.message });
  }
};