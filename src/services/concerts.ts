import axios from 'axios';
import { authService } from './auth';

export interface Concert {
  id: string;
  artist: string;
  venue: string;
  location: string;
  date: string;
  rating?: number;
  notes?: string;
  images?: string[];
  setlist?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateConcertDTO {
  artist: string;
  venue: string;
  date: string;
  notes?: string;
  images?: File[];
}

export interface UpdateConcertDTO extends Partial<CreateConcertDTO> {
  rating?: number;
  setlist?: string[];
}

export interface ConcertFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  ratingMin?: number;
  ratingMax?: number;
  venue?: string;
  sortBy?: string;
  year?: string;
}

// Hardcode the API URL for now
const API_URL = 'http://localhost:3000/api';

class ConcertService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  // Get user's personal concerts
  async getMyConcerts(filters?: ConcertFilters): Promise<Concert[]> {
    try {
      const response = await axios.get<Concert[]>(`${API_URL}/concerts/my`, {
        headers: this.getHeaders(),
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get global concert rankings
  async getGlobalRankings(filters?: ConcertFilters): Promise<Concert[]> {
    try {
      const response = await axios.get<Concert[]>(`${API_URL}/concerts/global`, {
        headers: this.getHeaders(),
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get a single concert by ID
  async getConcert(id: string): Promise<Concert> {
    try {
      const response = await axios.get<Concert>(`${API_URL}/concerts/${id}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create a new concert
  async createConcert(data: CreateConcertDTO): Promise<Concert> {
    try {
      const response = await axios.post<Concert>(`${API_URL}/concerts`, data, {
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update an existing concert
  async updateConcert(id: string, data: UpdateConcertDTO): Promise<Concert> {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'images' && value) {
          value.forEach((image: File) => {
            formData.append('images', image);
          });
        } else if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      const response = await axios.patch<Concert>(`${API_URL}/concerts/${id}`, formData, {
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update concert rating
  async updateRating(id: string, rating: number): Promise<Concert> {
    try {
      const response = await axios.patch<Concert>(
        `${API_URL}/concerts/${id}/rating`,
        { rating },
        {
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete a concert
  async deleteConcert(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/concerts/${id}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Handle image uploads
  async uploadImages(concertId: string, images: File[]): Promise<string[]> {
    try {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await axios.post<string[]>(
        `${API_URL}/concerts/${concertId}/images`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete an image
  async deleteImage(concertId: string, imageUrl: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/concerts/${concertId}/images`, {
        headers: this.getHeaders(),
        params: { imageUrl },
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    const axiosError = error as { response?: { data?: { message?: string }; }; message?: string; };
    if (axiosError.response?.data?.message) {
      return new Error(axiosError.response.data.message);
    }
    if (axiosError.message) {
      return new Error(axiosError.message);
    }
    return new Error('An unknown error occurred');
  }
}

export const concertService = new ConcertService(); 