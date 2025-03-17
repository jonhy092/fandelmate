
// DELETE /clientes/:id - Eliminar cliente
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        res.json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'No se puede eliminar el cliente porque tiene facturas asociadas' });
        }
        res.status(500).json({ error: 'Error al eliminar cliente' });
    }
});

module.exports = router; 