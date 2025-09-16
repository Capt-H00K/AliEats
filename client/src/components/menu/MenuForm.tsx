import React, { useState, useEffect } from 'react';
import { MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { addMenuItem, updateMenuItem } from '@/services/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface MenuFormProps {
  item?: MenuItem | null;
  onClose: () => void;
  onSave: () => void;
}

export const MenuForm: React.FC<MenuFormProps> = ({ item, onClose, onSave }) => {
  const { toast } = useToast();
  const { user } = useAuth(); // user.uid is restaurantId

  // Initialize form fields safely
  const [name, setName] = useState<string>(item?.name ?? '');
  const [description, setDescription] = useState<string>(item?.description ?? '');
  const [price, setPrice] = useState<number | ''>(item?.price ?? '');
  const [image, setImage] = useState<string>(item?.image ?? '');
  const [category, setCategory] = useState<string>(item?.category ?? '');
  const [available, setAvailable] = useState<boolean>(item?.available ?? true);
  const [loading, setLoading] = useState(false);

  // Ensure that if item changes (edit mode), state updates
  useEffect(() => {
    setName(item?.name ?? '');
    setDescription(item?.description ?? '');
    setPrice(item?.price ?? '');
    setImage(item?.image ?? '');
    setCategory(item?.category ?? '');
    setAvailable(item?.available ?? true);
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim() || price === '') {
      toast({ title: 'Error', description: 'Name and price are required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const restaurantId = user.id; // Firebase UID
      const priceNumber = Number(price);

      if (item?.id) {
        await updateMenuItem(restaurantId, item.id, {
          name,
          description,
          price: priceNumber,
          image,
          category,
          available
        });
        toast({ title: 'Updated', description: `${name} updated.` });
      } else {
        await addMenuItem(restaurantId, {
          name,
          description,
          price: priceNumber,
          image,
          category,
          available
        });
        toast({ title: 'Added', description: `${name} added.` });
      }

      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to save menu item', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Item Name"
        required
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        required
      />
      <Input
        type="number"
        value={price === '' ? '' : price}
        onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
        placeholder="Price"
        required
      />
      <Input
        value={image}
        onChange={(e) => setImage(e.target.value)}
        placeholder="Image URL"
      />
      <Input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category"
      />
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={available}
          onCheckedChange={(checked) => setAvailable(!!checked)}
        />
        <span>Available</span>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {item ? 'Update' : 'Add'} Item
        </Button>
      </div>
    </form>
  );
};
