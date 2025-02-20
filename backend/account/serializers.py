from django.core.mail import send_mail
from django.contrib.auth.models import User
from orders.models import Order, OrderItem
from rest_framework import serializers
from .models import PatientProfile, DoctorProfile, Document, ConsultationCategory

from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', "password", "is_staff"]

        extra_kwargs = {'password': {'write_only': True}}

class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = PatientProfile
        fields = '__all__'

class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    consultation_category = serializers.PrimaryKeyRelatedField(queryset=ConsultationCategory.objects.all())

    class Meta:
        model = DoctorProfile
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'

class SignupSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(max_length=128)
    user_type = serializers.ChoiceField(choices=[('doctor', 'Doctor'), ('patient', 'Patient')])
    name = serializers.CharField(max_length=100)
    surname = serializers.CharField(max_length=100)
    phone_number = serializers.CharField(max_length=15)
    id_number_or_passport = serializers.CharField(max_length=30)
    gender = serializers.ChoiceField(choices=[('male', 'Male'), ('female', 'Female')])
    date_of_birth = serializers.DateField()
    address = serializers.CharField()
    specialty = serializers.CharField(max_length=100, required=False)
    years_of_experience = serializers.IntegerField(required=False)
    consultation_category = serializers.PrimaryKeyRelatedField(queryset=ConsultationCategory.objects.all(), required=False)
    documents = serializers.ListField(child=serializers.FileField(), required=False)

    def create(self, validated_data):
        user_data = {
            'username': validated_data['username'],
            'email': validated_data['email'],
            'password': validated_data['password'],
        }
        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        profile_data = {
            'user': user,
            'name': validated_data['name'],
            'surname': validated_data['surname'],
            'phone_number': validated_data['phone_number'],
            'id_number_or_passport': validated_data['id_number_or_passport'],
            'gender': validated_data['gender'],
            'date_of_birth': validated_data['date_of_birth'],
            'address': validated_data['address'],
        }

        if validated_data['user_type'] == 'doctor':
            doctor_data = {
                **profile_data,
                'specialty': validated_data['specialty'],
                'years_of_experience': validated_data['years_of_experience'],
                'consultation_category': validated_data['consultation_category'],
            }
            doctor_serializer = DoctorProfileSerializer(data=doctor_data)
            doctor_serializer.is_valid(raise_exception=True)
            doctor_profile = doctor_serializer.save()
            self.send_welcome_email(user, 'doctor')
            return doctor_profile

        patient_serializer = PatientProfileSerializer(data=profile_data)
        patient_serializer.is_valid(raise_exception=True)
        patient_profile = patient_serializer.save()
        self.send_welcome_email(user, 'patient')
        return patient_profile

    def send_welcome_email(self, user, user_type):
      
        if user_type == 'doctor':
            subject = 'Welcome to the Clinic Platform'
            message = (
                'Dear Doctor, welcome to our platform. Your account will be activated in 78 hours pending background checks. '
                'If you have any other supported documents, please respond to this email with the attached documents.'
            )
        else:
            subject = 'Welcome to the Clinic Platform'
            message = 'Dear Patient, welcome to our platform.'
        send_mail(subject, message, 'from@example.com', [user.email])

    def validate(self, data):
        if data['user_type'] == 'doctor':
            if not data.get('specialty') or not data.get('years_of_experience') or not data.get('consultation_category'):
                raise serializers.ValidationError('Doctors must provide specialty, years of experience, and consultation category.')
        return data




class ConsultationCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationCategory
        fields = ['id', 'name']


###############################################################


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'drug', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')