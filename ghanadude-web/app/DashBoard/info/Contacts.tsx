import { useEffect, useState } from "react";
import ModalForm from "./ModalForm";
import {
  fetchContacts,
  createContact,
  updateContact,
  deleteContact,
} from "@/services/adminService";

// Define the Contact type
interface Contact {
  id: number;
  subject: string;
  email: string;
  phone: string;
  message: string;
}

const ContactsPage = () => {
  const [items, setItems] = useState<Contact[]>([]);
  const [formData, setFormData] = useState<Partial<Contact>>({});
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchContacts();
      setItems(data);
    };
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentId !== null) {
        await updateContact(currentId, formData);
        setMessage("Resource updated successfully!");
      } else {
        await createContact(formData);
        setMessage("Resource created successfully!");
      }
      setIsModalOpen(false);
      const data = await fetchContacts();
      setItems(data);
    } catch (error) {
      console.error("Operation failed:", error);
      setMessage("Failed to perform operation.");
    }
  };

  const handleEdit = (item: Contact) => {
    setFormData(item);
    setCurrentId(item.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteContact(id);
      setMessage("Resource deleted successfully!");
      const data = await fetchContacts();
      setItems(data);
    } catch (error) {
      console.error("Deletion failed:", error);
      setMessage("Failed to delete resource.");
    }
  };

  const openModal = () => {
    setFormData({});
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Manage Contacts</h1>
      <button
        onClick={openModal}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Add New
      </button>
      <ul className="list-disc pl-5 mb-8">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between">
            {item.subject}
            <div>
              <button
                onClick={() => handleEdit(item)}
                className="ml-4 bg-yellow-500 text-white px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="ml-4 bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <ModalForm
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        handleChange={handleChange}
        title={isEditing ? "Edit Contact" : "Add Contact"}
      />
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default ContactsPage;
